/* eslint-disable @typescript-eslint/no-explicit-any */ // TODO: TS - Use database parameters interface when they are ready
/* eslint-disable @typescript-eslint/default-param-last */
import _ from 'lodash';
import { set, omit, pick, prop, isArray, differenceWith, differenceBy, isEqual } from 'lodash/fp';

import { generateTimestampCode, stringIncludes, hooks as hooksUtils, errors } from '@strapi/utils';
import type { ID } from '@strapi/types/data';

import permissionDomain from '../domain/permission';
import type { AdminUser, AdminRole, Permission } from '../../../shared/contracts/shared';
import type { Action } from '../domain/action';

import { validatePermissionsExist } from '../validation/permission';
import roleConstants from './constants';
import { getService } from '../utils';

const { SUPER_ADMIN_CODE, CONTENT_TYPE_SECTION } = roleConstants;

const { createAsyncSeriesWaterfallHook } = hooksUtils;
const { ApplicationError } = errors;

const hooks = {
  willResetSuperAdminPermissions: createAsyncSeriesWaterfallHook(),
};

const ACTIONS = {
  publish: 'plugin::content-manager.explorer.publish',
};

// @ts-expect-error lodash types
const sanitizeRole: <T extends object>(obj: T) => Omit<T, 'users' | 'permissions'> = omit([
  'users',
  'permissions',
] as const);

export type AdminRoleWithUsersCount = AdminRole & { usersCount: number };

const COMPARABLE_FIELDS = ['conditions', 'properties', 'subject', 'action', 'actionParameters'];
const pickComparableFields = pick(COMPARABLE_FIELDS);

const jsonClean = <T extends object>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * Compare two permissions
 */
const arePermissionsEqual = (p1: Permission, p2: Permission): boolean => {
  if (p1.action === p2.action) {
    return isEqual(jsonClean(pickComparableFields(p1)), jsonClean(pickComparableFields(p2)));
  }

  return false;
};

/**
 * Create and save a role in database
 * @param attributes A partial role object
 */
const create = async (attributes: Partial<AdminRole>): Promise<AdminRole> => {
  const alreadyExists = await exists({ name: attributes.name });

  if (alreadyExists) {
    throw new ApplicationError(
      `The name must be unique and a role with name \`${attributes.name}\` already exists.`
    );
  }
  // @ts-expect-error - Update utils so generateTimeStampCode can be used without arguments
  const autoGeneratedCode = `${_.kebabCase(attributes.name)}-${generateTimestampCode()}`;

  const rolesWithCode = {
    ...attributes,
    code: attributes.code || autoGeneratedCode,
  };

  const result = await strapi.query('admin::role').create({ data: rolesWithCode });
  strapi.eventHub.emit('role.create', { role: sanitizeRole(result) });

  return result;
};

/**
 * Find a role in database
 * @param params query params to find the role
 * @param populate
 */
const findOne = (params = {}, populate?: unknown): Promise<AdminRole> => {
  return strapi.query('admin::role').findOne({ where: params, populate });
};

/**
 * Find a role in database with usersCounts
 * @param params query params to find the role
 * @param populate
 */
const findOneWithUsersCount = async (
  params = {},
  populate?: unknown
): Promise<AdminRoleWithUsersCount> => {
  const role = await strapi.query('admin::role').findOne({ where: params, populate });

  if (role) {
    role.usersCount = await getUsersCount(role.id);
  }

  return role;
};

/**
 * Find roles in database
 * @param params query params to find the roles
 * @param populate
 */
const find = (params = {}, populate: unknown): Promise<AdminRole[]> => {
  return strapi.query('admin::role').findMany({ where: params, populate });
};

/**
 * Find all roles in database
 */
const findAllWithUsersCount = async (params: any): Promise<AdminRoleWithUsersCount[]> => {
  const roles = (await strapi.entityService.findMany(
    'admin::role',
    params
  )) as AdminRoleWithUsersCount[];

  for (const role of roles) {
    role.usersCount = await getUsersCount(role.id);
  }

  return roles;
};

/**
 * Update a role in database
 * @param params query params to find the role to update
 * @param attributes A partial role object
 */
const update = async (params: any, attributes: Partial<AdminRole>): Promise<AdminRole> => {
  const sanitizedAttributes = _.omit(attributes, ['code']);

  if (_.has(params, 'id') && _.has(sanitizedAttributes, 'name')) {
    const alreadyExists = await exists({
      name: sanitizedAttributes.name,
      id: { $ne: params.id },
    });
    if (alreadyExists) {
      throw new ApplicationError(
        `The name must be unique and a role with name \`${sanitizedAttributes.name}\` already exists.`
      );
    }
  }

  const result = await strapi
    .query('admin::role')
    .update({ where: params, data: sanitizedAttributes });
  strapi.eventHub.emit('role.update', { role: sanitizeRole(result) });

  return result;
};

/**
 * Check if a role exists in database
 * @param params query params to find the role
 */
const exists = async (params = {} as unknown): Promise<boolean> => {
  const count = await strapi.query('admin::role').count({ where: params });
  return count > 0;
};

/**
 * Count the number of roles based on search params
 * @param params params used for the query
 */
const count = async (params = {} as any): Promise<number> => {
  return strapi.query('admin::role').count(params);
};

/**
 * Check if the given roles id can be deleted safely, throw otherwise
 * @param ids
 */
const checkRolesIdForDeletion = async (ids = [] as ID[]) => {
  const superAdminRole = await getSuperAdmin();

  if (superAdminRole && stringIncludes(ids, superAdminRole.id)) {
    throw new ApplicationError('You cannot delete the super admin role');
  }

  for (const roleId of ids) {
    const usersCount = await getUsersCount(roleId);
    if (usersCount !== 0) {
      throw new ApplicationError('Some roles are still assigned to some users');
    }
  }
};

/**
 * Delete roles in database if they have no user assigned
 * @param ids query params to find the roles
 */
const deleteByIds = async (ids = [] as ID[]): Promise<AdminRole[]> => {
  await checkRolesIdForDeletion(ids);

  await getService('permission').deleteByRolesIds(ids);

  const deletedRoles = [];
  for (const id of ids) {
    const deletedRole = await strapi.query('admin::role').delete({ where: { id } });

    if (deletedRole) {
      strapi.eventHub.emit('role.delete', { role: deletedRole });
      deletedRoles.push(deletedRole);
    }
  }

  return deletedRoles;
};

/** Count the number of users for some roles
 */
const getUsersCount = async (roleId: ID): Promise<number> => {
  return strapi.query('admin::user').count({ where: { roles: { id: roleId } } });
};

/** Returns admin role
 */
const getSuperAdmin = (): Promise<AdminRole | undefined> => findOne({ code: SUPER_ADMIN_CODE });

/** Returns admin role with userCount
 * @returns {Promise<role>}
 */
const getSuperAdminWithUsersCount = () => findOneWithUsersCount({ code: SUPER_ADMIN_CODE });

/** Create superAdmin, Author and Editor role is no role already exist
 */
const createRolesIfNoneExist = async () => {
  const someRolesExist = await exists();
  if (someRolesExist) {
    return;
  }

  const { actionProvider } = getService('permission');

  const allActions = actionProvider.values();
  const contentTypesActions = allActions.filter((a) => a.section === 'contentTypes');

  // create 3 roles
  const superAdminRole = await create({
    name: 'Super Admin',
    code: 'strapi-super-admin',
    description: 'Super Admins can access and manage all features and settings.',
  });

  await getService('user').assignARoleToAll(superAdminRole.id);

  const editorRole = await create({
    name: 'Editor',
    code: 'strapi-editor',
    description: 'Editors can manage and publish contents including those of other users.',
  });

  const authorRole = await create({
    name: 'Author',
    code: 'strapi-author',
    description: 'Authors can manage the content they have created.',
  });

  // create content-type permissions for each role
  const editorPermissions = getService('content-type').getPermissionsWithNestedFields(
    contentTypesActions,
    {
      restrictedSubjects: ['plugin::users-permissions.user'],
    }
  );

  const authorPermissions = editorPermissions
    .filter(({ action }: any) => action !== ACTIONS.publish)
    .map((permission: any) =>
      permissionDomain.create({ ...permission, conditions: ['admin::is-creator'] })
    );

  editorPermissions.push(...getDefaultPluginPermissions());
  authorPermissions.push(...getDefaultPluginPermissions({ isAuthor: true }));

  // assign permissions to roles
  await addPermissions(editorRole.id, editorPermissions);
  await addPermissions(authorRole.id, authorPermissions);
};

const getDefaultPluginPermissions = ({ isAuthor = false } = {}) => {
  const conditions = isAuthor ? ['admin::is-creator'] : [];

  // add plugin permissions for each role
  return [
    { action: 'plugin::upload.read', conditions },
    { action: 'plugin::upload.configure-view' },
    { action: 'plugin::upload.assets.create' },
    { action: 'plugin::upload.assets.update', conditions },
    { action: 'plugin::upload.assets.download' },
    { action: 'plugin::upload.assets.copy-link' },
  ].map(permissionDomain.create);
};

/** Display a warning if the role superAdmin doesn't exist
 *  or if the role is not assigned to at least one user
 */
const displayWarningIfNoSuperAdmin = async () => {
  const superAdminRole = await getSuperAdminWithUsersCount();
  const someUsersExists = await getService('user').exists();

  if (!superAdminRole) {
    strapi.log.warn("Your application doesn't have a super admin role.");
  } else if (someUsersExists && superAdminRole.usersCount === 0) {
    strapi.log.warn("Your application doesn't have a super admin user.");
  }
};

/**
 * Assign permissions to a role
 * @param roleId - role ID
 * @param {Array<Permission{action,subject,fields,conditions}>} permissions - permissions to assign to the role
 */
const assignPermissions = async (
  roleId: ID,
  permissions: Array<Pick<Permission, 'action' | 'subject' | 'conditions'>> = []
) => {
  await validatePermissionsExist(permissions);

  // Internal actions are not handled by the role service, so any permission
  // with an internal action is filtered out
  const internalActions = getService('permission')
    .actionProvider.values()
    .filter((action) => action.section === 'internal')
    .map((action) => action.actionId);

  const superAdmin = await getService('role').getSuperAdmin();
  const isSuperAdmin = superAdmin && superAdmin.id === roleId;
  const assignRole = set('role', roleId);

  const permissionsWithRole = permissions
    // Add the role attribute to every permission
    .map(assignRole)
    // Transform each permission into a Permission instance
    // @ts-expect-error - lodash set doesn't resolve the type appropriately
    .map(permissionDomain.create);

  const existingPermissions = await getService('permission').findMany({
    where: { role: { id: roleId } },
    populate: ['role'],
  });

  const permissionsToAdd = differenceWith(
    arePermissionsEqual,
    permissionsWithRole,
    existingPermissions
  ).filter((permission: Permission) => !internalActions.includes(permission.action));

  const permissionsToDelete = differenceWith(
    arePermissionsEqual,
    existingPermissions,
    permissionsWithRole
  ).filter((permission: Permission) => !internalActions.includes(permission.action));

  const permissionsToReturn = differenceBy('id', permissionsToDelete, existingPermissions);

  if (permissionsToDelete.length > 0) {
    // @ts-expect-error - lodash prop doesn't resolve the type appropriately
    await getService('permission').deleteByIds(permissionsToDelete.map(prop('id')));
  }

  if (permissionsToAdd.length > 0) {
    const newPermissions = await addPermissions(roleId, permissionsToAdd);
    permissionsToReturn.push(...newPermissions);
  }

  if (!isSuperAdmin && (permissionsToAdd.length || permissionsToDelete.length)) {
    await getService('metrics').sendDidUpdateRolePermissions();
  }

  return permissionsToReturn;
};

const addPermissions = async (roleId: ID, permissions: any) => {
  const { conditionProvider, createMany } = getService('permission');
  const { sanitizeConditions } = permissionDomain;

  const permissionsWithRole = permissions
    .map(set('role', roleId))
    // @ts-expect-error - refactor domain/permission Condition type, as it's now expecting
    // a string but it should be a Condition interface
    .map(sanitizeConditions(conditionProvider))
    .map(permissionDomain.create);

  return createMany(permissionsWithRole);
};

const isContentTypeAction = (action: Action) => action.section === CONTENT_TYPE_SECTION;

/**
 * Reset super admin permissions (giving it all permissions)
 */
const resetSuperAdminPermissions = async () => {
  const superAdminRole = await getService('role').getSuperAdmin();
  if (!superAdminRole) {
    return;
  }

  const permissionService = getService('permission');
  const contentTypeService = getService('content-type');

  const allActions = permissionService.actionProvider.values() as Action[];

  const contentTypesActions = allActions.filter((action) => isContentTypeAction(action));
  const otherActions = allActions.filter((action) => !isContentTypeAction(action));

  // First, get the content-types permissions
  const permissions = contentTypeService.getPermissionsWithNestedFields(
    contentTypesActions
  ) as Permission[];

  // Then add every other permission
  const otherPermissions = otherActions.reduce((acc, action) => {
    const { actionId, subjects } = action;

    if (isArray(subjects)) {
      acc.push(
        ...subjects.map((subject) => permissionDomain.create({ action: actionId, subject }))
      );
    } else {
      acc.push(permissionDomain.create({ action: actionId }));
    }

    return acc;
  }, [] as Permission[]);

  permissions.push(...otherPermissions);

  const transformedPermissions = (await hooks.willResetSuperAdminPermissions.call(
    permissions
  )) as Permission[];

  await assignPermissions(superAdminRole.id, transformedPermissions);
};

/**
 * Check if a user object includes the super admin role
 */
const hasSuperAdminRole = (user: AdminUser): boolean => {
  const roles = _.get(user, 'roles', []) as AdminRole[];

  return roles.map(prop('code')).includes(SUPER_ADMIN_CODE);
};

const constants = {
  superAdminCode: SUPER_ADMIN_CODE,
};

export default {
  hooks,
  sanitizeRole,
  create,
  findOne,
  findOneWithUsersCount,
  find,
  findAllWithUsersCount,
  update,
  exists,
  count,
  deleteByIds,
  getUsersCount,
  getSuperAdmin,
  getSuperAdminWithUsersCount,
  createRolesIfNoneExist,
  displayWarningIfNoSuperAdmin,
  addPermissions,
  hasSuperAdminRole,
  assignPermissions,
  resetSuperAdminPermissions,
  checkRolesIdForDeletion,
  constants,
};
