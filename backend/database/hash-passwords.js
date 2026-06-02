const bcrypt = require('bcryptjs');

async function main() {
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  console.log('Admin hash:', adminHash);

  const donorHash = await bcrypt.hash('Donor@1234', 12);
  console.log('Donor hash:', donorHash);

  const orgHash = await bcrypt.hash('Org@1234', 12);
  console.log('Org hash:', orgHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
