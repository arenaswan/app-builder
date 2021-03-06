import { includes, extend } from "lodash";

export const currentUser = {
  _isAdmin: undefined,

  canEdit(object) {
    const userId = object.user_id || (object.user && object.user.id);
    return this.isAdmin || (userId && userId === this.id);
  },

  canCreate() {
    return (
      this.hasPermission("create_query") || this.hasPermission("create_dashboard") || this.hasPermission("list_alerts")
    );
  },

  hasPermission(permission) {
    if (permission === "admin" && this._isAdmin !== undefined) {
      return this._isAdmin;
    }
    return includes(this.permissions, permission);
  },

  get isAdmin() {
    return this.hasPermission("admin");
  },

  set isAdmin(isAdmin) {
    this._isAdmin = isAdmin;
  },
};

export const clientConfig: any = {
  allowScriptsInUserInput: false,
  googleLoginEnabled: false,
  dateFormatList: ["DD/MM/YY", "YYYY-MM-DD", "MM/DD/YY"],
  pageSize: 20,
  showPermissionsControl: false,
  dateFormat: "YYYY-MM-DD",
  timeFormatList: ["HH:mm:ss", "HH:mm", "HH:mm:ss.SSS"],
  mailSettingsMissing: true,
  basePath: "https://redash-pcmes-test.jianhuabm.com/",
  floatFormat: "0,0.00",
  autoPublishNamedQueries: true,
  dateTimeFormat: "YYYY-MM-DD HH:mm",
  extendedAlertOptions: false,
  dashboardRefreshIntervals: [60, 300, 600, 1800, 3600, 43200, 86400],
  integerFormat: "0,0",
  queryRefreshIntervals: [
    60,
    300,
    600,
    900,
    1800,
    3600,
    7200,
    10800,
    14400,
    18000,
    21600,
    25200,
    28800,
    32400,
    36000,
    39600,
    43200,
    86400,
    // 604800,
    // 1209600,
    2592000,
  ],
  allowCustomJSVisualizations: false,
  pageSizeOptions: [5, 10, 20, 50, 100],
  tableCellMaxJSONSize: 50000,
  displayModeBar: "hover",
  disablePublicUrls: true,
};
export const messages = [];

// const logger = debug("redash:auth");
// const session = { loaded: false };

// const AuthUrls = {
//   Login: "login",
// };

export function updateClientConfig(newClientConfig) {
  extend(clientConfig, newClientConfig);
}

// function updateSession(sessionData) {
//   logger("Updating session to be:", sessionData);
//   extend(session, sessionData, { loaded: true });
//   extend(currentUser, session.user);
//   extend(clientConfig, session.client_config);
//   extend(messages, session.messages);
// }

// export const Auth = {
//   isAuthenticated() {
//     return session.loaded && session.user.id;
//   },
//   getLoginUrl() {
//     return AuthUrls.Login;
//   },
//   setLoginUrl(loginUrl) {
//     AuthUrls.Login = loginUrl;
//   },
//   login() {
//     const next = encodeURI(location.url);
//     logger("Calling login with next = %s", next);
//     window.location.href = `${AuthUrls.Login}?next=${next}`;
//   },
//   logout() {
//     logger("Logout.");
//     window.location.href = "logout";
//   },
//   loadSession() {
//     logger("Loading session");
//     if (session.loaded && session.user.id) {
//       logger("Resolving with local value.");
//       return Promise.resolve(session);
//     }

//     Auth.setApiKey(null);
//     return axios.get("api/session").then(data => {
//       updateSession(data);
//       return session;
//     });
//   },
//   loadConfig() {
//     logger("Loading config");
//     return axios.get("/api/config").then(data => {
//       updateSession({ client_config: data.client_config, user: { permissions: [] }, messages: [] });
//       return data;
//     });
//   },
//   setApiKey(apiKey) {
//     logger("Set API key to: %s", apiKey);
//     Auth.apiKey = apiKey;
//   },
//   getApiKey() {
//     return Auth.apiKey;
//   },
//   requireSession() {
//     logger("Requested authentication");
//     if (Auth.isAuthenticated()) {
//       return Promise.resolve(session);
//     }
//     return Auth.loadSession()
//       .then(() => {
//         if (Auth.isAuthenticated()) {
//           logger("Loaded session");
//           notifySessionRestored();
//           return session;
//         }
//         logger("Need to login, redirecting");
//         Auth.login();
//       })
//       .catch(() => {
//         logger("Need to login, redirecting");
//         Auth.login();
//       });
//   },
// };
