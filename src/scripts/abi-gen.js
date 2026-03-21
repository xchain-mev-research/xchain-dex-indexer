const { execSync } = require("child_process");

const [outDir, abiFile] = process.argv.slice(2);

if (!outDir || !abiFile) {
    console.error("Usage: npm run abi:gen -- <outputDir> <abiFile>");
    process.exit(1);
}

const cmd = `npx squid-evm-typegen ${outDir} ${abiFile}`;
console.log("Running:", cmd);
execSync(cmd, { stdio: "inherit" });
