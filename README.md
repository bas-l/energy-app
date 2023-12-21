# Energy app

You can fill in the expected consumption and duration starting on a specific date. It will average this consumption over the duration and calculate the expected costs. 
The app is just in the App.tsx, because it is in general too small to really split up. The duration is a textfield instead of a select for flexibility. It would be better of course to have presets for userfriendliness.
There is some error checking to make sure duration and consumption will not lead to divide by zero problems.

# Run
```
  npm i
  npm run dev
``` 

# linting
Due to time constraints no linter has been installed. Normally it would be prettier + eslint + a standard ruleset or the company specific rules.