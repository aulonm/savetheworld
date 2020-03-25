/* eslint no-undef: ["off"] */
/* eslint prefer-promise-reject-errors: ["off"] */
/* eslint-disable */
import Keycloak from 'keycloak-js';
import store from '../store';

export default class KeycloakAuthService {
  constructor(url, realm, clientId) {
    this.login = this.login.bind(this);
    this.loginLevel4 = this.loginLevel4.bind(this);
    this.logout = this.logout.bind(this);

    this.onAuthSuccess = this.onAuthSuccess.bind(this);
    this.onAuthError = this.onAuthError.bind(this);
    this.onAuthRefreshError = this.onAuthRefreshError.bind(this);
    this.onAuthRefreshSuccess = this.onAuthRefreshSuccess.bind(this);
    this.updateToken = this.updateToken.bind(this);

    this.keycloak = Keycloak({
      url,
      realm,
      clientId,
    });

    this.keycloak.onAuthSuccess = this.onAuthSuccess;
    this.keycloak.onAuthError = this.onAuthError;
    this.keycloak.onAuthRefreshSuccess = this.onAuthRefreshSuccess;
    this.keycloak.onAuthRefreshError = this.onAuthRefreshError;
  }

  init() {
    store.dispatch('setKeycloakUpdateToken', this.updateToken);
    return new Promise((resolve, reject) => {
      this.keycloak
        .init({
          onLoad: 'check-sso',
          promiseType: 'native',
          token: sessionStorage.getItem('accessToken'),
          refreshToken: sessionStorage.getItem('refreshToken'),
          idToken: sessionStorage.getItem('idToken'),
        })
        .then((isAuthenticated) => {
          if (isAuthenticated) {
            return resolve(true);
          }
          return resolve(false);
        })
        .catch(() => {
          return reject(false);
        });
    });
  }

  login(redirectUri) {
    this.keycloak.login({ redirectUri });
  }

  loginLevel4() {
    this.keycloak.logout({ redirectUri: `${this.keycloak.createLoginUrl()}&acr_values=Level4` });
  }

  logout(redirectUri) {
    this.keycloak.clearToken();
    localStorage.clear();
    sessionStorage.clear();
    this.keycloak.logout({ redirectUri });
  }

  static capitalizeFirstLetterOfNames(names) {
    return names
      .toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  }

  static securityLevelFromAcr(acr) {
    return Number(acr.charAt(acr.length - 1));
  }

  static securityLevelIsValid(idTokenParsed) {
    return idTokenParsed.acr && (idTokenParsed.acr === 'Level3' || idTokenParsed.acr === 'Level4');
  }

  static idTokenIsValid(idTokenParsed) {
    return (
      idTokenParsed.pid &&
      idTokenParsed.given_name &&
      idTokenParsed.family_name &&
      KeycloakAuthService.securityLevelIsValid(idTokenParsed)
    );
  }

  updateAccessTokenAndUserinfo() {
    sessionStorage.setItem('accessToken', this.keycloak.token);
    sessionStorage.setItem('refreshToken', this.keycloak.refreshToken);
    sessionStorage.setItem('idToken', this.keycloak.idToken);
    store.dispatch('setLoginLevel4Function', this.loginLevel4);
    store.dispatch('setLoginError', false);

    const element = document.getElementById('keycloak');

    store.dispatch('setURLs', {
      altinnURL: element.getAttribute('data-altinn'),
      eiendomsskattURL: element.getAttribute('data-eiendomsskatt'),
    });

    element.remove();

    if (KeycloakAuthService.idTokenIsValid(this.keycloak.idTokenParsed)) {
      store.dispatch('setBrukerinfo', {
        brukerId: this.keycloak.idTokenParsed.pid,
        fornavn: KeycloakAuthService.capitalizeFirstLetterOfNames(this.keycloak.idTokenParsed.given_name),
        etternavn: KeycloakAuthService.capitalizeFirstLetterOfNames(this.keycloak.idTokenParsed.family_name),
        sikkerhetsniva: KeycloakAuthService.securityLevelFromAcr(this.keycloak.idTokenParsed.acr),
        email: this.keycloak.idTokenParsed.email,
      });
      if (store.getters.hasNoRepresentatives) {
        store.dispatch('getRepresentations');
      }
    } else {
      store.dispatch('setError', true);
    }
  }

  onAuthSuccess() {
    this.updateAccessTokenAndUserinfo();
  }

  onAuthError() {
    this.logout();
  }

  onAuthRefreshSuccess() {
    sessionStorage.setItem('accessToken', this.keycloak.token);
    sessionStorage.setItem('refreshToken', this.keycloak.refreshToken);
    sessionStorage.setItem('idToken', this.keycloak.idToken);
  }

  onAuthRefreshError() {
    store.dispatch('setLoginError', true);
    console.error('User session has expired');
  }

  /**
   * Updates token if possible. Sets new accessToken in Vuex.
   * @param minValidity: seconds left on token validity before we try to refresh the token
   * @returns {Promise<any>}
   */
  updateToken(minValidity = 10) {
    return this.keycloak
      .updateToken(minValidity)
      .then((refreshed) => {
        if (refreshed) {
          sessionStorage.setItem('accessToken', this.keycloak.token);
          sessionStorage.setItem('refreshToken', this.keycloak.refreshToken);
          sessionStorage.setItem('idToken', this.keycloak.idToken);
          return Promise.resolve(true);
        }
        return Promise.resolve(true);
      })
      .catch(() => {
        return Promise.reject(new Error());
      });
  }
}
