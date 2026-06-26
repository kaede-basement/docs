# Feature Comparison

## Table

The following table compares cross-platform (desktop only) launchers. References only include other tables that were used in this feature comparison.

The "User Interface" and "User Experience" fields included results of testing the listed launchers on a laptop with Windows 10 IoT Enterprise LTSC 21H2, AMD Ryzen 5 5500U (CPU), and AMD Radeon RX Vega 7 (iGPU).

For more launchers, see Tayou's table[^1].

<!--suppress CheckEmptyScriptTag -->
<table>
  <thead>
    <tr>
      <th>Launchers / Features</th>
      <th><a href="https://github.com/PrismLauncher/PrismLauncher/">Prism Launcher</a></th>
      <th><a href="https://github.com/HMCL-dev/HMCL">HMCL</a></th>
      <th><a href="https://github.com/voxelum/x-minecraft-launcher">XMCL</a></th>
      <th><a href="https://github.com/UNIkeEN/SJMCL">SJMCL</a></th>
      <th><a href="https://modrinth.com/app">Modrinth App</a></th>
      <th><a href="https://atlauncher.com/">ATLauncher</a></th>
      <th><a href="https://www.curseforge.com/download/app">CurseForge App</a></th>
      <th><a href="https://www.feed-the-beast.com/ftb-app">FTB App</a></th>
      <th><a href="https://github.com/gorilla-devs/GDLauncher-Carbon">GDLauncher Carbon</a></th>
      <th><a href="https://github.com/Nitrolaunch/nitrolaunch">nitrolaunch</a></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="11">Technical</td>
    </tr>
    <tr>
      <td>Technology Stack</td>
      <td>C++ <Secondary>(Qt)</Secondary><Ref id="1" /></td>
      <td>Java <Secondary>(JavaFX)</Secondary></td>
      <td>TypeScript <Secondary>(Vue, Electron)</Secondary></td>
      <td>TypeScript, Rust <Secondary>(React, Tauri)</Secondary></td>
      <td>JavaScript, Rust <Secondary>(Vue, Tauri)</Secondary><Ref id="1" /></td>
      <td>Java <Secondary>(Swing)</Secondary><Ref id="1" /></td>
      <td>JavaScript <Secondary>(React, Electron)</Secondary><Ref id="1" /></td>
      <td>Java, JavaScript <Secondary>(Vue, Electron)</Secondary><Ref id="1" /></td>
      <td>TypeScript, Rust <Secondary>(Astro)</Secondary><Ref id="1" /></td>
      <td>TypeScript, Rust <Secondary>(Tauri)</Secondary></td>
    </tr>
    <tr>
      <td>RAM usage (before / after short interactions)</td>
      <td>26 / 40 MB <Secondary>(+15 MB with a custom theme)</Secondary></td>
      <td>150 / 300 MB</td>
      <td>230 / 440 MB</td>
      <td>200 / 290 MB</td>
      <td>340 / 600 MB</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="11">Appearance</td>
    </tr>
    <tr>
      <td>User Interface</td>
      <td>Primitive</td>
      <td>Sleek; <Secondary>close to Material Design 2</Secondary></td>
      <td>Sleek; <Secondary>Vuetify (a mix of Material Design 2 & 3)</Secondary></td>
      <td>Sleek; <Secondary>Chakra UI v2</Secondary></td>
      <td>Sleek; <Secondary>a mix of different modern design systems</Secondary></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>User Experience</td>
      <td>Responsive and smooth</td>
      <td>A bit choppy <Secondary>(quick but animations are lagging)</Secondary></td>
      <td>A bit choppy <Secondary>(might be slow; animations sometimes lag)</Secondary></td>
      <td>Responsive and smooth</td>
      <td>A bit choppy <Secondary>(might be slow; animations sometimes lag)</Secondary></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Customization</td>
      <td>Custom themes <Secondary>(QCSS)</Secondary></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="11">Accounts</td>
    </tr>
    <tr>
      <td>Authentication</td>
      <td>MSA, Offline; <Secondary>requires MSA</Secondary></td>
      <td>MSA, Offline, LittleSkin, Custom Auth servers</td>
      <td>MSA, Offline, Ely.by, LittleSkin, Custom Auth servers</td>
      <td>MSA, Offline, LittleSkin, Custom Auth servers; <Secondary>requires MSA</Secondary></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Skin Manager</td>
      <td>Only for MSA</td>
      <td colspan="3">Yes; <Secondary>with 3D viewer</Secondary></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Java Management</td>
      <td>Downloading, Switching</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="11">Mod Loader & OptiFine Support</td>
    </tr>
    <tr>
      <td>OptiFine</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>LiteLoader</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Forge</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Fabric</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Quilt</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>NeoForge</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="11">Instances</td>
    </tr>
    <tr>
      <td>Import</td>
      <td>MultiMC, Modrinth, CurseForge, Technic</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Export</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Toggling version metadata updates</td>
      <td><Status has /> <Secondary>(always checks)</Secondary></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="11">Connection</td>
    </tr>
    <tr>
      <td><a href="https://bmclapidoc.bangbang93.com/">BMCLAPI</a> Support</td>
      <td><Status /></td>
      <td colspan="2">Yes</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Service Ping Tests</td>
      <td></td>
      <td></td>
      <td></td>
      <td>Yes</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Download Tasks</td>
      <td></td>
      <td></td>
      <td></td>
      <td>Yes</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

## References

[^1]: https://mc-launcher.tayou.org/
