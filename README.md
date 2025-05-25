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
