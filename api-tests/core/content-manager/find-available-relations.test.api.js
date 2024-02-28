'use strict';

const { createTestBuilder } = require('api-tests/builder');
const { createStrapiInstance } = require('api-tests/strapi');
const { createAuthRequest } = require('api-tests/request');
const modelsUtils = require('api-tests/models');

let strapi;
let rq;
const data = {
  products: {
    draft: [],
    published: [],
  },
  shops: {
    draft: [],
    published: [],
  },
  shopRelations: {},
  testData: {},
};

const productUid = 'api::product.product';
const shopUid = 'api::shop.shop';
const compoUid = 'default.compo';

const compo = (withRelations = false) => ({
  displayName: 'compo',
  category: 'default',
  attributes: {
    name: {
      type: 'string',
    },
    ...(!withRelations
      ? {}
      : {
          compo_products_ow: {
            type: 'relation',
            relation: 'oneToOne',
            target: productUid,
          },
          compo_products_mw: {
            type: 'relation',
            relation: 'oneToMany',
            target: productUid,
          },
        }),
  },
});

const productModel = () => ({
  attributes: {
    name: {
      type: 'string',
    },
  },
  displayName: 'Product',
  singularName: 'product',
  pluralName: 'products',
  description: '',
  collectionName: '',
});

const shopModel = () => ({
  attributes: {
    name: {
      type: 'string',
    },
    products_ow: {
      type: 'relation',
      relation: 'oneToOne',
      target: productUid,
    },
    products_oo: {
      type: 'relation',
      relation: 'oneToOne',
      target: productUid,
      targetAttribute: 'shop',
    },
    products_mo: {
      type: 'relation',
      relation: 'manyToOne',
      target: productUid,
      targetAttribute: 'shops_mo',
    },
    products_om: {
      type: 'relation',
      relation: 'oneToMany',
      target: productUid,
      targetAttribute: 'shop_om',
    },
    products_mm: {
      type: 'relation',
      relation: 'manyToMany',
      target: productUid,
      targetAttribute: 'shops',
    },
    products_mw: {
      type: 'relation',
      relation: 'oneToMany',
      target: productUid,
    },
    myCompo: {
      type: 'component',
      repeatable: false,
      component: compoUid,
    },
  },
  displayName: 'Shop',
  singularName: 'shop',
  pluralName: 'shops',
});

const createEntry = async (uid, data) => {
  const { body } = await rq({
    method: 'POST',
    url: `/content-manager/collection-types/${uid}`,
    body: data,
  });
  return body;
};

describe('Relations: Find Available', () => {
  const builder = createTestBuilder();
  const addPublishedAtCheck = (value) => {
    publishedAt: value;
  };

  beforeAll(async () => {
    await builder.addComponent(compo(false)).addContentTypes([productModel(), shopModel()]).build();

    await modelsUtils.modifyComponent(compo(true));

    strapi = await createStrapiInstance();
    rq = await createAuthRequest({ strapi });

    // Create 2 draft products
    const [skate, chair, candle, table] = await Promise.all([
      createEntry(productUid, { name: 'Skate' }),
      createEntry(productUid, { name: 'Chair' }),
      createEntry(productUid, { name: 'Candle' }),
      createEntry(productUid, { name: 'Table' }),
    ]);

    data.products.draft.push(skate.data, chair.data, candle.data, table.data);
    const productMapping = {
      skate: data.products.draft[0],
      chair: data.products.draft[1],
      candle: data.products.draft[2],
      table: data.products.draft[3],
    };

    // Publish Skate and Chair
    const [publishedSkate, publishedChair] = await Promise.all([
      rq({
        url: `/content-manager/collection-types/${productUid}/${productMapping.skate.id}/actions/publish`,
        method: 'POST',
      }),
      rq({
        url: `/content-manager/collection-types/${productUid}/${productMapping.chair.id}/actions/publish`,
        method: 'POST',
      }),
    ]);
    data.products.published.push(publishedSkate.body.data, publishedChair.body.data);

    /**
     * Tranform the draft relations into published relations if they exist
     */
    const buildPublishedRelations = (draftRelations, publishedProducts) => {
      const publishedRelations = JSON.parse(JSON.stringify(draftRelations));

      const replaceWithPublished = (draftProduct) => {
        const published = publishedProducts.find(
          (publishedProduct) => publishedProduct.id === draftProduct.id
        );

        return published || undefined;
      };

      // Iterate over relations and replace products with their published counterparts
      for (const key in publishedRelations) {
        if (Array.isArray(publishedRelations[key])) {
          publishedRelations[key] = publishedRelations[key]
            .map(replaceWithPublished)
            .filter(Boolean);
        } else if (
          typeof publishedRelations[key] === 'object' &&
          publishedRelations[key] !== null
        ) {
          publishedRelations[key] = replaceWithPublished(publishedRelations[key]);
        }
      }

      return publishedRelations;
    };

    // Define the relations between the shops and the products
    const draftRelations = {
      products_ow: data.products.draft[0],
      products_oo: data.products.draft[2],
      products_mo: data.products.draft[1],
      products_om: data.products.draft,
      products_mm: data.products.draft.slice(0, 2),
      products_mw: [data.products.draft[1], data.products.draft[3]],
      myCompo: {
        compo_products_ow: data.products.draft[2],
        compo_products_mw: [data.products.draft[0]],
      },
    };
    const publishedRelations = buildPublishedRelations(draftRelations, data.products.published);

    const shopRelations = {
      draft: draftRelations,
      published: publishedRelations,
    };
    data.shopRelations = shopRelations;

    // Create 2 draft shops
    const [draftShop, draftEmptyShop] = await Promise.all([
      createEntry(shopUid, {
        name: 'Cazotte Shop',
        products_ow: shopRelations.draft.products_ow.id,
        products_oo: shopRelations.draft.products_oo.id,
        products_mo: shopRelations.draft.products_mo.id,
        products_om: shopRelations.draft.products_om.map((product) => product.id),
        products_mm: shopRelations.draft.products_mm.map((product) => product.id),
        products_mw: shopRelations.draft.products_mw.map((product) => product.id),
        myCompo: {
          compo_products_ow: shopRelations.draft.myCompo.compo_products_ow.id,
          compo_products_mw: shopRelations.draft.myCompo.compo_products_mw.map(
            (product) => product.id
          ),
        },
      }),
      createEntry(shopUid, {
        name: 'Empty Shop',
        myCompo: {
          compo_products_ow: null,
          compo_products_mw: [],
        },
      }),
    ]);
    data.shops.draft.push(draftShop.data, draftEmptyShop.data);

    // Publish both shops
    const [publishedShop, publishedEmptyShop] = await Promise.all([
      rq({
        url: `/content-manager/collection-types/${shopUid}/${data.shops.draft[0].id}/actions/publish`,
        method: 'POST',
      }),
      rq({
        url: `/content-manager/collection-types/${shopUid}/${data.shops.draft[1].id}/actions/publish`,
        method: 'POST',
      }),
    ]);
    data.shops.published.push(publishedShop.body.data, publishedEmptyShop.body.data);

    // Define the ids of the shops we will use for testing
    const testData = {
      component: {
        // If the target attribute represents a component, the id we use to
        // query for relations is the id of the component, not the id of the
        // parent entity
        modelUID: compoUid,
        id: data.shops.draft[0].myCompo.id,
        idEmptyShop: data.shops.draft[1].myCompo.id,
      },
      entity: {
        modelUID: shopUid,
        id: data.shops.draft[0].id,
        idEmptyShop: data.shops.draft[1].id,
      },
    };
    data.testData = testData;
  });

  afterAll(async () => {
    await strapi.destroy();
    await builder.cleanup();
  });

  /**
   * Find all the ids of the products that are related to the entity
   */
  const getRelatedProductIds = (isComponent, status, fieldName) => {
    let relatedProductIds;
    if (isComponent) {
      relatedProductIds = data.shopRelations[status].myCompo[fieldName];
    } else {
      relatedProductIds = data.shopRelations[status][fieldName];
    }

    if (Array.isArray(relatedProductIds)) {
      relatedProductIds = relatedProductIds.map((relation) => relation?.id);
    } else {
      relatedProductIds = [relatedProductIds?.id];
    }

    return relatedProductIds;
  };

  describe('Content type failure cases', () => {
    test('Fail when entity is not found', async () => {
      const res = await rq({
        method: 'GET',
        url: `/content-manager/relations/${shopUid}/products_ow`,
        qs: {
          id: 'docIdDoesntExist',
          status: 'draft',
        },
      });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {},
          message: 'Entity not found',
          name: 'NotFoundError',
          status: 404,
        },
      });
    });

    test("Fail when the field doesn't exist", async () => {
      const res = await rq({
        method: 'GET',
        url: `/content-manager/relations/${shopUid}/unknown_field`,
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {},
          message: `The relational field unknown_field doesn't exist on ${shopUid}`,
          name: 'ValidationError',
          status: 400,
        },
      });
    });

    test('Fail when the field exists but is not a relational field', async () => {
      const res = await rq({
        method: 'GET',
        url: `/content-manager/relations/${shopUid}/name`,
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {},
          message: `The relational field name doesn't exist on ${shopUid}`,
          name: 'ValidationError',
          status: 400,
        },
      });
    });
  });

  describe('Component failure cases', () => {
    test('Fail when the component is not found', async () => {
      const res = await rq({
        method: 'GET',
        url: `/content-manager/relations/${compoUid}/compo_products_ow`,
        qs: {
          id: 99999,
        },
      });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {},
          message: 'Entity not found',
          name: 'NotFoundError',
          status: 404,
        },
      });
    });

    test("Fail when the field doesn't exist", async () => {
      const res = await rq({
        method: 'GET',
        url: `/content-manager/relations/${compoUid}/unknown`,
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {},
          message: `The relational field unknown doesn't exist on ${compoUid}`,
          name: 'ValidationError',
          status: 400,
        },
      });
    });

    test('Fail when the field exists but is not a relational field', async () => {
      const res = await rq({
        method: 'GET',
        url: `/content-manager/relations/${compoUid}/name`,
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        data: null,
        error: {
          details: {},
          message: `The relational field name doesn't exist on ${compoUid}`,
          name: 'ValidationError',
          status: 400,
        },
      });
    });
  });

  // Run tests against every type of relations in the shop content type
  describe.only.each([
    ['products_ow', false],
    ['products_oo', false],
    ['products_mo', false],
    ['products_om', false],
    ['products_mm', false],
    ['products_mw', false],
    ['compo_products_ow', true],
    ['compo_products_mw', true],
  ])('Relational field (%s) (is in component: %s)', (fieldName, isComponent) => {
    // Perform the same tests for both draft and published entities
    // Components don't have a published status
    const statuses = isComponent ? [['draft']] : [['draft'], ['published']];

    describe.each(statuses)(`Get Available %s relation(s)`, (status) => {
      describe.each([[true], [false]])('Can retrieve all available relation(s)', (useEmptyShop) => {
        test(`when entity ID is ${!useEmptyShop ? 'undefined' : 'an empty entity'}`, async () => {
          const { modelUID, idEmptyShop } = isComponent
            ? data.testData.component
            : data.testData.entity;
          const id = useEmptyShop ? idEmptyShop : undefined;

          const res = await rq({
            method: 'GET',
            url: `/content-manager/relations/${modelUID}/${fieldName}`,
            qs: {
              id,
              status,
            },
          });
          expect(res.status).toBe(200);

          expect(res.body.results.map((result) => result.id)).toMatchObject(
            data.products[status]
              // Results form the request should be sorted by name
              // but are not necessarily in the same order as data.products
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((product) => product.id)
          );

          const idsToOmit = [data.products[status][1]?.id].filter(Boolean);
          const omitIdsRes = await rq({
            method: 'GET',
            url: `/content-manager/relations/${modelUID}/${fieldName}`,
            qs: {
              id,
              status,
              idsToOmit,
            },
          });

          expect(omitIdsRes.body.results).toHaveLength(
            data.products[status]
              .map((product) => product.id)
              .filter((id) => !idsToOmit.includes(id)).length
          );
        });
      });

      test(`Get relations for ${fieldName}`, async () => {
        const { id, modelUID } = isComponent ? data.testData.component : data.testData.entity;

        const res = await rq({
          method: 'GET',
          url: `/content-manager/relations/${modelUID}/${fieldName}`,
          qs: {
            id,
            status,
          },
        });
        expect(res.status).toBe(200);

        // Get the ids of the products that are not already related to this entity
        const availableProductIds = data.products[status]
          .filter((product) => {
            return !getRelatedProductIds(isComponent, status, fieldName).includes(product.id);
          })
          .map((product) => product.id);

        expect(res.body.results.map((result) => result.id)).toMatchObject(
          // The results should be the products that are not already related to the shop
          // TODO is matching the ids enough?
          availableProductIds
        );

        const idsToOmit = [data.products[status][1]?.id].filter(Boolean);
        const omitIdsRes = await rq({
          method: 'GET',
          url: `/content-manager/relations/${modelUID}/${fieldName}`,
          qs: {
            id,
            status,
            idsToOmit,
          },
        });

        expect(omitIdsRes.body.results).toHaveLength(
          availableProductIds.filter((id) => !idsToOmit.includes(id)).length
        );
      });

      describe.only('Search', () => {
        const searchTerms = [
          ['Skate'],
          ['Candle'],
          ['Chair'],
          ['Table'],
          ['skate'],
          ['candle'],
          ['Skate'.substring(0, 3)],
          ['Candle'.substring(0, 3)],
          ['Chair'.substring(3)],
          ['table'.substring(2)],
          ['nothing'],
          ['nothing'.substring(0, 3)],
          [''],
        ];
        describe.each(searchTerms)(`Search with term %s`, (searchTerm) => {
          test('Can search entity', async () => {
            const { id, modelUID } = isComponent ? data.testData.component : data.testData.entity;

            const res = await rq({
              method: 'GET',
              url: `/content-manager/relations/${modelUID}/${fieldName}`,
              qs: {
                _q: searchTerm,
                id,
                status,
              },
            });
            expect(res.status).toBe(200);

            // We expect to get products that are not already related to the entity
            // and that fuzzy match the search query
            const expected = data.products[status].filter(
              (product) =>
                new RegExp(searchTerm, 'i').test(product.name) &&
                !getRelatedProductIds(isComponent, status, fieldName).includes(product.id)
            );

            expect(res.body.results).toHaveLength(expected.length);
            expect(res.body.results).toMatchObject(
              expected.map((product) => ({
                id: product.id,
                name: product.name,
                ...addPublishedAtCheck(status === 'published' ? expect().not.toBeNull() : null),
              }))
            );
          });
        });
      });
    });
  });
});
