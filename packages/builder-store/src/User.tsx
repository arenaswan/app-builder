import { flow, types } from "mobx-state-tree";
import { API } from './API';
import { Settings } from "./Settings";

const MAX_VALIDATE_TIMES = 3;

export const User = types.model({
  me: types.maybeNull(types.frozen()),
  session: types.maybeNull(types.frozen()),
  isLoading: false,
  isLoginFailed: false,
  validateTimes: 0
})
.actions(self => {
  const setSession = (session: any) => {
    self.session = session;
  };
  const loadSession = flow(function* loadSession() {
    try {
      self.validateTimes++;
      if(self.validateTimes > MAX_VALIDATE_TIMES){
        self.isLoginFailed = true
        return null;
      }
      self.isLoading = true;
      // 获取user session信息
      const session = yield API.client.validate();
      if(!window.Meteor){
        /**临时请求bootstrap接口拿到所有对象信息给Creator.Objects赋值，这样包括任务对象的“相关项”字段在内的optionsFunction函数都能正常执行*/
        const bootstrap = yield API.client.bootstrap();
        const Creator = window.Creator;
        Creator.Objects = bootstrap.objects;
      }
      setSession(session);
      self.isLoading = false;
      return session;
    } catch (error) {
      self.isLoading = false;
      // self.isLoginFailed = true
      setSession(null)
      console.error("Failed to validate", error)
      return null;
    }
  });
  const getSession = () => {
    if(self.isLoading)
      return null;
    if (!self.session && !self.isLoginFailed)
      loadSession();
    return self.session
  };
  const getCompanyOrganizationIds  = () => {
    const session = getSession();
    if (session && session.companies){
      return session.companies.map((c: any)=> c.organization);
    }
    return []
  }
  const setMe = (user: any) => {
    self.me = user;
  };
  const goLogin = () => {
    Settings.setUserId(null)
    Settings.setAuthToken(null)
    // window.location.href = `/login`;
  };
  const loadMe = flow(function* loadMe() {
    try {
      self.isLoading = true;
      // 获取user信息， 不需要传入 spaceId，否则传错的话会导致可能验证失败
      API.client.setSpaceId(null);
      const me = yield API.client.getMe();
      Settings.setUserId(me._id)
      if (me.spaces.length>0) {
        API.client.setSpaceId(me.spaces[0]._id);
        Settings.setTenantId(me.spaces[0]._id)
      }
      setMe(me);
      self.isLoading = false;
      self.isLoginFailed = false
      return me;
    } catch (error) {
      self.isLoading = false;
      self.isLoginFailed = true
      setMe(null)
      console.error("Failed to fetch userinfo", error)
      return null;
    }
  });
  const getMe = () => {
    if (!self.me && !self.isLoginFailed){
      loadMe();
    }
    return self.me
  }
  return {
    loadMe,
    getMe, 
    loadSession,
    getSession, 
    getCompanyOrganizationIds,
    login: flow(function* login(userInput, passowrd) {
      self.isLoading = true;
      let email = '';
      let mobile = '';
      let username = '';
      if (userInput) {
          if (userInput.indexOf('@') > 0) {
              email = userInput;
          } else if (userInput.length === 11 && new Number(userInput) > 10000000000) {
              mobile = userInput;
          } else {
              username = userInput;
          }
      }

      const user = { email: email, mobile: mobile, username: username, spaceId: "" }

      try {
          const data = yield API.client.login(user, passowrd);
          if (data.token) {
            API.client.setToken(data.token);
            Settings.setAuthToken(data.token)
          }
          const me = yield User.loadMe();
          // console.log("==API.client.getSpaceId==1=", API.client.getSpaceId());
          yield User.loadSession();
          self.isLoading = false;
          self.isLoginFailed = false
          return me
      } catch (error) {
        self.isLoading = false;
        self.isLoginFailed = true
        console.error("Failed to fetch userinfo", error)
        goLogin();
      }
    }),
    logout: flow(function* logout() {
        try {
            yield API.client.logout();
            setMe(null)
            setSession(null)
            Settings.setUserId(null)
            Settings.setAuthToken(null)
            Settings.setTenantId(null)
            goLogin();
        } catch (error) {
            console.error("Failed to fetch userinfo", error)
            goLogin();
        }
    }),
    afterCreate() {
      
    }
  }
}).create()