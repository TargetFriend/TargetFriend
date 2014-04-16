#TargetFriend#
TargetFriend is a scoring app for archers.

##License##
`TargetFriend` is distributed under the MIT license (see LICENSE).

##Contribution##
###Version Change###
When changing version number, you have to change it in following files:

	- package.json
	- bower.json
	- app/config.json (+ versionCode)
	- app/config.xml (+ versionCode)

Or you can run:

```bash
grunt changeVersion:"yourversion"
```

Don't forget the CHANGELOG file! Also add a new update entry in translation files.

###Bower Components###
- Please use the `rebind-debug` branch of `angular-rebind`.

For more documentation see [TargetFriend_doc](https://github.com/archer96/TargetFriend_doc).

###Cordova Plugins###
*TargetFriend* uses the following plugins:

 - org.apache.cordova.console
 - org.apache.cordova.device
 - org.apache.cordova.dialogs
 - org.apache.cordova.file
 - org.apache.cordova.file-transfer
 - org.apache.cordova.inappbrowser

###Known Issues###
To prevent a transition bug see: https://github.com/ajoslin/angular-mobile-nav/issues/72
