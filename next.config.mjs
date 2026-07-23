const config = {
  transpilePackages: ['nextjs-shared'],
  serverExternalPackages: ['pg', '@neondatabase/serverless'],
  logging: {
    fetches: { fullUrl: false }
  }
}

export default config
