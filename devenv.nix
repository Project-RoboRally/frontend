{ pkgs, lib, ... }:

{
  packages = with pkgs; [
    git
    prettier
  ];

  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  languages.typescript.enable = true;

  scripts.build.exec = ''pnpm build'';
  scripts.test.exec = ''pnpm test'';
  scripts.lint.exec = ''pnpm lint'';
  scripts.run.exec = ''pnpm run dev'';
  scripts.format.exec = ''prettier --write .'';
  scripts.format-check.exec = ''prettier --check .'';

  enterShell = ''
    echo "Devenv active"
  '';
}
