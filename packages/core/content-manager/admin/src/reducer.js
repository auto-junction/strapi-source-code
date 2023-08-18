import rbacManagerReducer from './hooks/useSyncRbac/reducer';
import cmAppReducer from './pages/App/reducer';
import editViewLayoutManagerReducer from './pages/EditViewLayoutManager/reducer';
import listViewReducer from './pages/ListView/reducer';
import editViewCrudReducer from './sharedReducers/crudReducer/reducer';

const contentManagerReducers = {
    'content-manager_app': cmAppReducer,
    'content-manager_listView': listViewReducer,
    'content-manager_rbacManager': rbacManagerReducer,
    'content-manager_editViewLayoutManager': editViewLayoutManagerReducer,
    'content-manager_editViewCrudReducer': editViewCrudReducer,
};

export default contentManagerReducers;