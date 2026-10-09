// Plain `tsc` does not resolve `.astro` imports; `astro check` does. This keeps both happy.
declare module "*.astro" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
