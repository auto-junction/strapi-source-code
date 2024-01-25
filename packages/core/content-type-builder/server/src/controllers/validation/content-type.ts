/* eslint-disable no-template-curly-in-string */ // yup templates need to be in this format

import { flatMap, getOr, has } from 'lodash/fp';
import { yup, validateYupSchema } from '@strapi/utils';

import type { Schema, UID } from '@strapi/types';
import { getService } from '../../utils';
import { modelTypes, DEFAULT_TYPES, typeKinds } from '../../services/constants';
import { createSchema } from './model-schema';
import { removeEmptyDefaults, removeDeletedUIDTargetFields } from './data-transform';
import { nestedComponentSchema } from './component';

// Input flattens some fields of the "info" into the root type
export type CreateContentTypeInput = {
  contentType?: Partial<Schema.ContentType> & Partial<Schema.ContentTypeInfo>;
  components?: Array<Partial<Schema.Component> & Partial<Schema.Info> & { tmpUID?: UID.Component }>;
  singularName: Schema.ContentTypeInfo['singularName'];
  attributes: Schema.Attributes & Record<string, any>;
  kind: Schema.ContentTypeKind;
  collectionName?: Schema.CollectionType['collectionName'];
  pluralName: Schema.ContentTypeInfo['pluralName'];
  displayName: Schema.ContentTypeInfo['displayName'];
  description: Schema.ContentTypeInfo['description'];
  options?: Schema.Options;
  draftAndPublish?: Schema.Options['draftAndPublish'];
  pluginOptions?: Schema.ContentType['pluginOptions'];
  config?: object;
};

/**
 * Allowed relation per type kind
 */
const VALID_RELATIONS = {
  [typeKinds.SINGLE_TYPE]: [
    'oneToOne',
    'oneToMany',
    'morphOne',
    'morphMany',
    'morphToOne',
    'morphToMany',
  ],
  [typeKinds.COLLECTION_TYPE]: [
    'oneToOne',
    'oneToMany',
    'manyToOne',
    'manyToMany',
    'morphOne',
    'morphMany',
    'morphToOne',
    'morphToMany',
  ],
} as const;

/**
 * Allowed types
 */
const VALID_TYPES = [...DEFAULT_TYPES, 'uid', 'component', 'dynamiczone', 'customField'];

/**
 * Returns a yup schema to validate a content type payload
 */
const createContentTypeSchema = (data: CreateContentTypeInput, { isEdition = false } = {}) => {
  const kind: keyof typeof VALID_RELATIONS = getOr(
    typeKinds.COLLECTION_TYPE,
    'contentType.kind',
    data
  );
  const contentTypeSchema = createSchema(VALID_TYPES, VALID_RELATIONS[kind] || [], {
    modelType: modelTypes.CONTENT_TYPE,
  })
    .shape({
      displayName: yup.string().min(1).required(),
      singularName: yup
        .string()
        .min(1)
        .test(nameIsAvailable(isEdition))
        .test(forbiddenContentTypeNameValidator())
        .isKebabCase()
        .required(),
      pluralName: yup
        .string()
        .min(1)
        .test(nameIsAvailable(isEdition))
        .test(nameIsNotExistingCollectionName(isEdition)) // TODO: v5: require singularName to not match a collection name
        .test(forbiddenContentTypeNameValidator())
        .isKebabCase()
        .required(),
    })
    .test(
      'singularName-not-equal-pluralName',
      '${path}: singularName and pluralName should be different',
      (value) => value.singularName !== value.pluralName
    );

  return yup
    .object({
      // FIXME .noUnknown(false) will strip off the unwanted properties without throwing an error
      // Why not having .noUnknown() ? Because we want to be able to add options relatable to EE features
      // without having any reference to them in CE.
      // Why not handle an "options" object in the content-type ? The admin panel needs lots of rework
      // to be able to send this options object instead of top-level attributes.
      // @nathan-pichon 20/02/2023
      contentType: contentTypeSchema.required().noUnknown(false),
      components: nestedComponentSchema,
    })
    .noUnknown();
};

/**
 * Validator for content type creation
 */
export const validateContentTypeInput = (data: CreateContentTypeInput) => {
  return validateYupSchema(createContentTypeSchema(data))(data);
};

/**
 * Validator for content type edition
 */
export const validateUpdateContentTypeInput = (data: CreateContentTypeInput) => {
  if (has('contentType', data)) {
    removeEmptyDefaults(data.contentType);
    removeDeletedUIDTargetFields(data.contentType as Schema.ContentType);
  }

  if (has('components', data) && Array.isArray(data.components)) {
    data.components.forEach((comp) => {
      if (has('uid', comp)) {
        removeEmptyDefaults(comp as Schema.Component);
      }
    });
  }

  return validateYupSchema(createContentTypeSchema(data, { isEdition: true }))(data);
};

const forbiddenContentTypeNameValidator = () => {
  const reservedNames = getService('builder').getReservedNames().models;

  return {
    name: 'forbiddenContentTypeName',
    message: `Content Type name cannot be one of ${reservedNames.join(', ')}`,
    test(value: unknown) {
      // test for a case-insensitive match
      const lowercaseValue = (value as string)?.toLowerCase();
      return !(
        lowercaseValue && reservedNames.map((name) => name.toLowerCase()).includes(lowercaseValue)
      );
    },
  };
};

const nameIsAvailable = (isEdition: boolean) => {
  // TODO TS: if strapi.contentTypes (ie, ContentTypes) works as an ArrayLike and is used like this, we may want to ensure it is typed so that it can be without using as
  const usedNames = flatMap((ct: Schema.ContentType) => {
    return [ct.info?.singularName, ct.info?.pluralName];
  })(strapi.contentTypes as any);

  return {
    name: 'nameAlreadyUsed',
    message: 'contentType: name `${value}` is already being used by another content type.',
    test(value: unknown) {
      // don't check on edition
      if (isEdition) return true;

      return !usedNames.includes(value as string);
    },
  };
};

const nameIsNotExistingCollectionName = (isEdition: boolean) => {
  const usedNames = Object.keys(strapi.contentTypes).map(
    (key) => strapi.contentTypes[key as UID.ContentType].collectionName
  );

  return {
    name: 'nameAlreadyUsed',
    message: 'contentType: name `${value}` is already being used by another content type.',
    test(value: unknown) {
      // don't check on edition
      if (isEdition) return true;

      return !usedNames.includes(value as string);
    },
  };
};

/**
 * Validates type kind
 */
const kindSchema = yup.string().oneOf([typeKinds.SINGLE_TYPE, typeKinds.COLLECTION_TYPE]);

export const validateKind = validateYupSchema(kindSchema);
