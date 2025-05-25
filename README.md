# Xbox One error codes

Repository contains listings of POST / error codes

Website: https://xboxoneresearch.github.io/errorcodes/

[POST Codes list](./postcodes.csv)

[System errors list](./system.csv)

[System errors (E errors) by @TorusHyperV](https://github.com/TorusHyperV/XboxOne-EXXX-err-Codes)

These will be transferred over here eventually to have everything in one place.

## Console Types

| Identifier | Name                   |
| ---------- | -----------------------|
| ALL        | Valid for all versions |
| XOP        | Xbox One PHAT          |
| XOS        | Xbox One S             |
| XOX        | Xbox One X             |
| XSS        | Xbox Series S          |
| XSX        | Xbox Series X          |

## Error Types

| Identifier | Name               |
| ---------- | ------------------ |
| SMC        | SMC / Southrbridge |
| SP         | Security Processor |
| CPU        | CPU                |
| OS         | Operating System   |

## Metadata format

There is a `meta.json` generated and uploaded to [errors.xboxresearch.com](https://errors.xboxresearch.com/meta.json).
This can be used to programmatically retrieve the error lists and check for updates to locally stored files.

Current `formatVersion` is `2`.

Make sure to always check `formatVersion` when retrieving the data, to ensure the client can parse the CSV files.

## CSV Structure

You will probably **NOT** need this information when editing the CSV files, as most modern applications (Office suites etc.) should handle it properly.

### General notes

- If fields `Name` or `Description` contain spaces or characters other than `A-Z`, `a-z`, `_`, `-`, they need to be wrapped in `"`.
- If field `Console` contains a comma-seperated list of applicable consoles, this need to wrapped in `"` as well.

## Scripts

There are scripts to verify CSVs and also create metadata.

- scripts/create_meta.py
  - Usage: `./create_meta.py [destination meta.json]`
  - Creates information about the last update of the bundle of CSV files
  - meta.json can be used to programmatically check for updates on `https://errors.xboxresearch.com`, by downloading `https://errors.xboxresearch.com/meta.json`

## Credits / Greetz

- [@craftbenmine](https://github.com/craftbenmine)
- [@dony](https://github.com/apewalkers)
- [@ACE Console Repairs](https://github.com/ACE-AU)
- The rest of the team
