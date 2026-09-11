{ pkgs, lib, ... }:

{
  packages = with pkgs; [
    git
  ];

  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  languages.typescript.enable = true;

  scripts.build.exec = ''
    pnpm build
  '';

  scripts.test.exec = ''
    pnpm test
  '';

  scripts.lint.exec = ''
    pnpm lint
  '';

  scripts.run.exec = ''
    pnpm run dev
  '';

  enterShell = ''
    echo "Devenv active"
  '';
}
