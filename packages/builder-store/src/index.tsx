import { API } from './API';
import { Forms } from './Form';
import { Tables } from './Table';
import { Objects } from './Object';
import { Settings } from './Settings';
import { Apps } from './Apps'
import { User } from './User'
import { Queries } from './Queries';
import { ComponentRegistry } from './ComponentRegistry';
import { Pages } from './Pages';
const stores = {
  Forms,
  Tables,
  Objects,
  Settings,
  API,
  Apps,
  User,
  Queries,
  ComponentRegistry,
  Pages
};

// if (process.env.NODE_ENV !== 'production') {
  (window as any).stores = stores;
// }

export {
  Forms,
  Tables,
  Objects,
  Settings,
  API,
  Apps,
  User,
  Queries,
  ComponentRegistry,
  Pages
}

export default stores;

declare global {
  interface Window {
      Creator: any
  }
  interface Window {
    Meteor: any
  }
  interface Window {
    SteedosUI: any
  }
  interface Window {
    Steedos: any
  }
}

if(!window.Meteor){
  window.Creator = {};
  window.Creator.Objects = {};
}
