# SafeKeepVault

SafeKeepVault is a specialized operating system designed exclusively for high-security, air-gapped Bitcoin cryptographic operations. It runs locally as a locked-down, auditable environment, allowing users to safely manage seeds, sign complex multisig transactions, and execute cryptographic splits without ever touching an internet-connected machine.

## Core Engineering Philosophy

1. **Absolute Air-Gapping:** SafeKeep OS is built to live on a dedicated, offline USB drive. 
2. **Minimal Supply Chain Risk:** We intentionally avoid importing massive third-party cryptographic or UR-encoding libraries. The codebase is lean, auditable, and relies on native functions.
3. **Stateless by Default:** The system features a robust "Temporary Mode" that operates entirely in RAM. All sensitive data is wiped instantly upon session termination.
4. **Deterministic Data Transport:** We champion standard, unencrypted "Transfer Drives" and strict Base64/Hex/Binary file transport over brittle camera-based QR stitching for large multisig payloads.

## What's New in v1.1b

The v1.1b release includes major architectural upgrades to transport logic and security validation:

* **Smart PSBT Ingestion:** The PSBT Signer now automatically detects and decodes Base64, Hex, and raw binary payloads, eliminating formatting friction when moving files across the airgap via the Courier tool.
* **Dynamic Export Naming:** Exported transactions now utilize timestamped file generation (e.g., `sparrow-tx-signed-143022.psbt`), preventing catastrophic overwrites in multi-signer workflows.
* **Advanced Hijack Detection Logic:** Re-engineered the single-sig validation logic to gracefully handle watch-only wildcard fingerprints (`00000000`), eliminating false positives while maintaining a strict cryptographic boundary against true change-address hijacks.
* **UI/UX Overhaul:** Reordered the Advanced Tools hierarchy for logical workflow, eliminated OS-level emojis for a strict professional aesthetic, and implemented an instant `SIGKILL` shutdown sequence to remove system hang.

## Building from Source

To compile the SafeKeep OS image yourself on a Linux environment:

1. Clone or download this repository.
2. Ensure you have the necessary Linux build dependencies installed.
3. Make the build script executable:
   ```bash
   chmod +x build.sh
Run the build script with root privileges:

Bash
sudo ./build.sh
This will compile the source into a flashable .img file.

Flashing the Image
Use a tool like BalenaEtcher, Rufus, or the standard dd command to flash the safekeep.img file to a high-quality USB 3.0 drive (minimum 4GB recommended).
