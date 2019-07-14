
[![Build Status](https://travis-ci.org/reach2jeyan/Stress-test-your-Android-App.svg?branch=master)](https://travis-ci.org/reach2jeyan/Stress-test-your-Android-App)

![](stresstest.gif)

**IF YOU WISH TO VIEW CRASHES, YOU HAVE GOTTA ENABLE CRASHLYTICS FOR NOW.**

Stress test your application is basically built over the android Monkey runner. This will save time for the users who have to keep running or writing commands to run on various multiple devices

**OS Supported**
1. Mac
2. Windows(Unreleased)

**Usage**
1. Download the dmg file and install it on your mac machine(You need to allow it from the security settings)
2. Launch the software and manually enter the adb path. Please attach till (platform-tools/adb)
3. Mention the package name of the app and choose the device you want to run the the stress test
4. Click RUN TEST to see your test in action

**Problems?:**
1. In case you have given the wrong path, Click on reset adb and quit the app


**Contribute?**
I am very short on time for this with my regular work on and I would definetly want to expand this tool to have a lot of features built in with a formal coding practice involved. Free feel to create a branch yourselves and shoot up Pull requests. 

**Roadmap:**
1. Support Windows machine
2. Enable getting path quickly, include crash logs exported to user home if any
3. Integrate monkey-runner with iOS