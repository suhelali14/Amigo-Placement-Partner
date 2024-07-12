/** @type { import("drizzle-kit").Config } */
export default {
  schema: ["./utils/schema.js", "./utils/codingSchema.js"], // Include both schema files
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://Mockinterview_owner:Vhk7AfrGy4XH@ep-jolly-sea-a516xm41.us-east-2.aws.neon.tech/Mockinterview?sslmode=require',
  }
};
