db.users.findOne({"sajuProfile.fourPillars": {$exists: true}}, {sajuProfile: 1})
