export type AuthorizationHeaderFactory = () => string | undefined;

export interface AuthorizationRenewal {
  pending(): Promise<boolean> | undefined;
  prepareRead(): Promise<boolean> | undefined;
  recoverRead(sentAuthorization: string): Promise<boolean> | undefined;
}

let authorization = {
  epoch: 0,
  header: (() => undefined) as AuthorizationHeaderFactory,
  renewal: undefined as AuthorizationRenewal | undefined,
};

export function registerAuthorizationHeaderFactory(
  header: AuthorizationHeaderFactory,
  renewal?: AuthorizationRenewal,
): void {
  authorization = { epoch: authorization.epoch + 1, header, renewal };
}

export function currentAuthorization() {
  return authorization;
}

export function resolveAuthorizationHeader(): string | undefined {
  return authorization.header();
}
