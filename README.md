

# UI tests

### Setup procedure. npm command For test launch

```jest```  command for tests launch and execution resides in 
> e2etests/package.json

file.  So depending upon where tests are being triggered (locally or from CI) respective command(-s) for test launch are :

```npm run test-dev```

```npm run test-latestCommit```


### Visual Studio Code || Webstorm extensions (code prettier)
For Webstorm (or any other inteliJ IDE), open settings
Languages & Frameworks > javascript > Prettier

- pick up Node intepreter e.g (C:\Program Files\nodejs\node.exe)
- pick up Prettier package e.g (..\rtls-promo-v3\webtool\node_modules\prettier)


 For VSCode one needs to install the Prettier extension and then add the following to your ```settings.json```
 
``` "editor.formatOnSave": true,```

```"editor.formatOnPaste": true,```

``` "editor.defaultFormatter": "esbenp.prettier-vscode"```

### allure results 

#### allure results generation via command-line option
to install allure command-line - please follow the instruction: 
https://docs.qameta.io/allure/#_installing_a_commandline

After tests execution - open/navigate to  rtls-promo-v3/e2etests folder and
run ```allure serve```  command.

#### allure results generation via docker 
to generate tests reports via docker  - open/navigate to  rtls-promo-v3/e2etests folder and
use the following command
```docker-compose up allure```
Reports should be available on 
> http://localhost:4040

### Windows machine specific settings

#### testMatch explicit regexp
In order to avoid any testMatch and regular expression issues, 
recommend adding a ```__tests__```  folder in **e2etests** and place test for further development.   

Respective ```package.json``` modifications: 
   
    "roots": [
      "<rootDir>/__tests__/"
    ],
    "testMatch": [
      "<rootDir>/__tests__/*.js?(x)"
    ]

