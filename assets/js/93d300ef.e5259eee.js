"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[2521],{3969:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>s,metadata:()=>a,toc:()=>c});var o=n(3117),t=(n(7294),n(3905));const s={title:"useAdminRolePermissions",description:"API reference for the useAdminRolePermissions hook",tags:["admin","hooks","roles","permissions"]},i=void 0,a={unversionedId:"docs/core/admin/hooks/use-admin-role-permissions",id:"docs/core/admin/hooks/use-admin-role-permissions",title:"useAdminRolePermissions",description:"API reference for the useAdminRolePermissions hook",source:"@site/docs/docs/01-core/admin/04-hooks/use-admin-role-permissions.mdx",sourceDirName:"docs/01-core/admin/04-hooks",slug:"/docs/core/admin/hooks/use-admin-role-permissions",permalink:"/docs/core/admin/hooks/use-admin-role-permissions",draft:!1,editUrl:"https://github.com/strapi/strapi/tree/main/docs/docs/docs/01-core/admin/04-hooks/use-admin-role-permissions.mdx",tags:[{label:"admin",permalink:"/tags/admin"},{label:"hooks",permalink:"/tags/hooks"},{label:"roles",permalink:"/tags/roles"},{label:"permissions",permalink:"/tags/permissions"}],version:"current",frontMatter:{title:"useAdminRolePermissions",description:"API reference for the useAdminRolePermissions hook",tags:["admin","hooks","roles","permissions"]},sidebar:"docs",previous:{title:"Review Workflows",permalink:"/settings/review-workflows"},next:{title:"useAdminRoles",permalink:"/docs/core/admin/hooks/use-admin-roles"}},l={},c=[{value:"Usage",id:"usage",level:2},{value:"Typescript",id:"typescript",level:2},{value:"Fetch all permissions for a role",id:"fetch-all-permissions-for-a-role",level:3}],p={toc:c};function m(e){let{components:r,...n}=e;return(0,t.kt)("wrapper",(0,o.Z)({},p,n,{components:r,mdxType:"MDXLayout"}),(0,t.kt)("p",null,"An abstraction around ",(0,t.kt)("inlineCode",{parentName:"p"},"react-query"),"'s ",(0,t.kt)("inlineCode",{parentName:"p"},"useQuery")," hook. It can be used to fetch permissions for one admin role."),(0,t.kt)("h2",{id:"usage"},"Usage"),(0,t.kt)("p",null,"The hooks can receive two optional parameters:"),(0,t.kt)("ol",null,(0,t.kt)("li",{parentName:"ol"},"query params: an object containing the query params to be sent to the API. They are going to be\nstringified by ",(0,t.kt)("inlineCode",{parentName:"li"},"qs"),". All params are equal except ",(0,t.kt)("inlineCode",{parentName:"li"},"id"),", which is used to fetch a single users, if\nit is passed."),(0,t.kt)("li",{parentName:"ol"},"options: an object containing the options to be passed to ",(0,t.kt)("inlineCode",{parentName:"li"},"useQuery"),".")),(0,t.kt)("p",null,"It returns an object containing some of the react-query attributes."),(0,t.kt)("h2",{id:"typescript"},"Typescript"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-ts"},"import { UseQueryOptions } from 'react-query'\n\ntype Permissions = object;\n\nuseAdminRolePermissions(queryParams: object, reactQueryOptions: UseQueryOptions): {\n    permissions: Permissions,\n    isLoading: boolean;\n    error: object;\n    isError: boolean;\n    refetch: () => Promise<void>;\n};\n")),(0,t.kt)("h3",{id:"fetch-all-permissions-for-a-role"},"Fetch all permissions for a role"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-jsx"},"import { useAdminRolePermissions } from 'path/to/hooks';\n\nconst MyComponent = ({ onMoveItem }) => {\n  const { permissions, isLoading, refetch } = useAdminRolePermissions({ id: roleId });\n\n  return /* ... */;\n};\n")))}m.isMDXComponent=!0},3905:(e,r,n)=>{n.d(r,{Zo:()=>p,kt:()=>d});var o=n(7294);function t(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function s(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,o)}return n}function i(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?s(Object(n),!0).forEach((function(r){t(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function a(e,r){if(null==e)return{};var n,o,t=function(e,r){if(null==e)return{};var n,o,t={},s=Object.keys(e);for(o=0;o<s.length;o++)n=s[o],r.indexOf(n)>=0||(t[n]=e[n]);return t}(e,r);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(o=0;o<s.length;o++)n=s[o],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(t[n]=e[n])}return t}var l=o.createContext({}),c=function(e){var r=o.useContext(l),n=r;return e&&(n="function"==typeof e?e(r):i(i({},r),e)),n},p=function(e){var r=c(e.components);return o.createElement(l.Provider,{value:r},e.children)},m={inlineCode:"code",wrapper:function(e){var r=e.children;return o.createElement(o.Fragment,{},r)}},u=o.forwardRef((function(e,r){var n=e.components,t=e.mdxType,s=e.originalType,l=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),u=c(n),d=t,f=u["".concat(l,".").concat(d)]||u[d]||m[d]||s;return n?o.createElement(f,i(i({ref:r},p),{},{components:n})):o.createElement(f,i({ref:r},p))}));function d(e,r){var n=arguments,t=r&&r.mdxType;if("string"==typeof e||t){var s=n.length,i=new Array(s);i[0]=u;var a={};for(var l in r)hasOwnProperty.call(r,l)&&(a[l]=r[l]);a.originalType=e,a.mdxType="string"==typeof e?e:t,i[1]=a;for(var c=2;c<s;c++)i[c]=n[c];return o.createElement.apply(null,i)}return o.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);