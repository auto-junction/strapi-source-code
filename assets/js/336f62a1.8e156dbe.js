"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[1967],{8092:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>u,frontMatter:()=>c,metadata:()=>i,toc:()=>s});var r=n(3117),a=(n(7294),n(3905));const c={title:"Watch",tags:["pack-up","CLI"]},o=void 0,i={unversionedId:"docs/utils/pack-up/commands/watch",id:"docs/utils/pack-up/commands/watch",title:"Watch",description:"Usage",source:"@site/docs/docs/05-utils/pack-up/01-commands/04-watch.mdx",sourceDirName:"docs/05-utils/pack-up/01-commands",slug:"/docs/utils/pack-up/commands/watch",permalink:"/docs/utils/pack-up/commands/watch",draft:!1,editUrl:"https://github.com/strapi/strapi/tree/main/docs/docs/docs/05-utils/pack-up/01-commands/04-watch.mdx",tags:[{label:"pack-up",permalink:"/tags/pack-up"},{label:"CLI",permalink:"/tags/cli"}],version:"current",sidebarPosition:4,frontMatter:{title:"Watch",tags:["pack-up","CLI"]},sidebar:"docs",previous:{title:"Check",permalink:"/docs/utils/pack-up/commands/check"},next:{title:"Configuration",permalink:"/docs/utils/pack-up/config"}},p={},s=[{value:"Usage",id:"usage",level:2},{value:"API",id:"api",level:2},{value:"Usage",id:"usage-1",level:3},{value:"Typescript",id:"typescript",level:2}],l={toc:s};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h2",{id:"usage"},"Usage"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"$ yarn pack-up watch\n")),(0,a.kt)("p",null,"Watches your current package for changes and rebuilds when necessary."),(0,a.kt)("h2",{id:"api"},"API"),(0,a.kt)("h3",{id:"usage-1"},"Usage"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { watch } from '@strapi/pack-up';\n\nwatch();\n")),(0,a.kt)("h2",{id:"typescript"},"Typescript"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"interface WatchOptions {\n  configFile: false;\n  config?: Config;\n  cwd?: string;\n  debug?: boolean;\n  silent?: boolean;\n}\n\ntype Watch = (options?: WatchOptions) => Promise<void>;\n")))}u.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>m});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},c=Object.keys(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,c=e.originalType,p=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),d=s(n),m=a,f=d["".concat(p,".").concat(m)]||d[m]||u[m]||c;return n?r.createElement(f,o(o({ref:t},l),{},{components:n})):r.createElement(f,o({ref:t},l))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var c=n.length,o=new Array(c);o[0]=d;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i.mdxType="string"==typeof e?e:a,o[1]=i;for(var s=2;s<c;s++)o[s]=n[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);