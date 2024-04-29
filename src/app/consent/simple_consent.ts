export class SimpleConsent {
  public mode: 'always' | 'never' | 'custom' = 'always';
  public purposes: { treatment: boolean; research: boolean } = {
    treatment: true,
    research: true,
  };
  public categories: { [key: string]: boolean } = {};
}
