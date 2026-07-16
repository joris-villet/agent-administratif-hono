// /****************************************
//  *
//  *      NEVER USE THIS SCRIPT IN PROD
//  *
//  ****************************************/
// import { spawn } from "node:child_process";
// import readline from "readline/promises";
// import { stdin as input, stdout as output } from "process";
// import * as os from "node:os";

// const rl = readline.createInterface({ input, output });

// //let ngrokUrl: string = "";

// async function main() {
//   try {
//     // await createHashVault();
//     // await Bun.sleep(3000);
//     // const container = await startContainerVault();
//     // console.log("✅ Container vault started => ", container);
//     // const urlVaultWarden = await startNgrok();
//     // console.log("✅ urlVaultWarden => ", urlVaultWarden);
//   } catch (error) {
//     console.log("❌ error function main => ", error);
//   }
// }

// async function createHashVault(): Promise<void> {
//   try {
//     //const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

//     // const ptyProcess = pty.spawn(
//     //   "docker",
//     //   ["run", "--rm", "vaultwarden/server", "/vaultwarden", "hash"],
//     //   {
//     //     name: "xterm-color",
//     //     cols: 80,
//     //     rows: 30,
//     //   }
//     // );

//     let output = "";
//     let step = 0;

//     // ptyProcess.onData((data) => {
//     //   output += data;
//     //   console.log("DATA:", JSON.stringify(data));

//     //   // if (data.includes("Password") && step === 0) {
//     //   //   ptyProcess.write("tonpassword\r");
//     //   //   step++;
//     //   // } else if (data.includes("Confirm") && step === 1) {
//     //   //   ptyProcess.write("tonpassword\r");
//     //   //   step++;
//     //   // }
//     // });

//     // let hash: string = "";
//     // const generateHash = spawn("openssl", ["rand", "-base64", "48"]);

//     // generateHash.stdout.on("data", (data) => {
//     //   hash = Buffer.from(data).toString();
//     //   console.log("stdout hash => ", hash);
//     // });

//     // generateHash.stderr.on("data", (data) => {
//     //   console.log("stderr hash => ", data);
//     // });
//     // docker run --rm vaultwarden/server /vaultwarden hash

//     // if (hash) {
//     //   const command = spawn("docker", [
//     //     "run",
//     //     "--rm",
//     //     "vaultwarden/server",
//     //     "/vaultwarden",
//     //     hash,
//     //   ]);
//     //   command.stdout.on("data", (data) => {
//     //     console.log("stdout hash => ", data);
//     //   });

//     //   command.stderr.on("data", (data) => {
//     //     console.log("stderr hash => ", data);
//     //   });
//     // }

//     // const pass1 = await rl.question("Mot de passe Vaultwarden: ");

//     // rl.on("line", (stream) => {
//     //   console.log("stream => ", stream);
//     // });
//     // const pass2 = await rl.question("Confirmer: ");
//     // rl.close();

//     // if (pass1 !== pass2) {
//     //   console.error("Les mots de passe ne correspondent pas");
//     //   process.exit(1);
//     // }

//     // const proc = spawn("docker", [
//     //   "run",
//     //   "--rm",
//     //   "-i",
//     //   "vaultwarden/server",
//     //   "/vaultwarden",
//     //   "hash",
//     // ]);
//     // proc.stdout.on("data", (data) => {
//     //   console.log(`stdout: ${data}`);
//     // });
//     // proc.stdin.on("drain", (data) => {
//     //   console.log("data pipe => ", data);
//     // });
//     // proc.stderr.on("data", (data) => {
//     //   console.error(`stderr: ${data}`);
//     // });
//   } catch (error) {
//     console.log("❌ error function createHashVault => ", error);
//   }
// }

// async function startContainerVault(): Promise<boolean | void> {
//   const proc = spawn("docker", ["compose", "up"]);
//   proc.stdout.on("data", (data) => {
//     console.log(`stdout: ${data}`);
//   });

//   proc.stderr.on("data", (data) => {
//     console.error(`stderr: ${data}`);
//   });

//   // proc.stdin.on("pipe", (data) => {
//   //   console.log("data pipe => ", data);
//   // });

//   return new Promise((resolve) => {
//     const check = async () => {
//       try {
//         const res = await fetch("http://localhost:8888");

//         if (res.ok) {
//           resolve(true);
//         } else {
//           setTimeout(check, 500);
//         }
//       } catch {
//         setTimeout(check, 500);
//       }
//     };

//     check();
//   });
// }

// async function startNgrok(): Promise<string | void> {
//   try {
//     Bun.spawn(["ngrok", "http", "8888"], {
//       stdout: "ignore",
//       stderr: "ignore",
//     });

//     await Bun.sleep(3000);

//     const res = (await fetch("http://127.0.0.1:4040/api/tunnels")) as Record<
//       string,
//       any
//     >;
//     const data = await res.json();

//     if (data) {
//       const urlVaultWarden = data.tunnels[0].public_url;
//       // console.log("✅ Tunnel URL:", urlVaultWarden);
//       return urlVaultWarden;
//       //ngrokUrl = url;
//     }
//   } catch (error) {
//     console.log("❌ error setNgrokUrl => ", error);
//   }
// }

// await main();
