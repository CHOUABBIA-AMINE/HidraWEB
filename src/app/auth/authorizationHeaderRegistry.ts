export type AuthorizationHeaderFactory = () => string | undefined;

let authorizationHeaderFactory: AuthorizationHeaderFactory = () => undefined;

export function registerAuthorizationHeaderFactory(factory: AuthorizationHeaderFactory): void {
  authorizationHeaderFactory = factory;
}

export function resolveAuthorizationHeader(): string | undefined {
  return authorizationHeaderFactory();
}
