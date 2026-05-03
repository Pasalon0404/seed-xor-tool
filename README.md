# SafeKeepVault

SafeKeepVault is a specialized operating system designed exclusively for high-security, air-gapped Bitcoin cryptographic operations. It runs locally as a locked-down, auditable environment, allowing users to safely manage seeds, sign complex multisig transactions, and execute cryptographic splits without ever touching an internet-connected machine.

## Core Engineering Philosophy

* **Absolute Air-Gapping:** SafeKeep OS is built to live on a dedicated, offline USB drive.
* **Minimal Supply Chain Risk:** We intentionally avoid importing massive third-party cryptographic or UR-encoding libraries. The codebase is lean, auditable, and relies on native functions.
* **Stateless by Default:** The system features a robust "Temporary Mode" that operates entirely in RAM. All sensitive data is wiped instantly upon session termination.
* **Deterministic Data Transport:** We champion standard, unencrypted "Transfer Drives" and strict Base64/Hex/Binary file transport over brittle camera-based QR stitching for large multisig payloads.

## Building from Source

To compile the SafeKeep OS image yourself on a Linux environment:

1. Clone or download this repository.
2. Ensure you have the necessary Linux build dependencies installed.
3. Make the build script executable:
   ```bash
   chmod +x usbbootdrive/build.sh