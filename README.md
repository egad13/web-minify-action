
# Web Minify Action

![Release version][badge_release_version] [![Build Status][badge_build]][link_build] [![License][badge_license]][link_license]

A GitHub action that minifies javascript files for deployment, so your project is as light as a feather.

To get things done, this action relies on:
- [UglifyJS][uglifyjs].

## Basic Usage

To minify all `.js` files in the `src` directory in place:
```yaml
jobs:
  uglify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main
        uses: actions/checkout@v3
        with:
          ref: ${{ github.ref }}

      - uses: egad13/web-minify-action@v0
        with:
          input-dir: ./src
          js: true
          js-suffix: false
```

## Supported Platforms

This is a JavaScript action and is supported on Linux, Windows, and MacOS.

| OS (runs-on) | ubuntu-latest | macos-latest | windows-latest |
|--------------|:-------------:|:------------:|:--------------:|
| Support      |      ✅️      |      ✅️      |       ✅️       |

## Options

The following input variables can be configured:

| Name          | Required | Description | Default |
|---------------|:--------:|-------------|:-------:|
| `input-dir`  | Yes      | Source folder containing files to minify. |  |
| `output-dir` | No       | Path where minified files will be saved. By default, they'll be in the same location as the original files. | same as `input-dir` |
| `max-depth`  | No       | The number of levels to descend into subdirectories when scanning for source files. | `0` |
| `js`         | No       | Indicates if javascript files should be minified. | `false` |
| `js-config`  | No       | A path to a [configuration file](#javscript-configuration) to use when minifying javascript. If specified, the `js` option is considered true. | (empty) |
| `js-suffix`  | No       | Indicates if javascript output files should have the suffix `.min` added after their name. | `true` |

> [!IMPORTANT]
> If the action input `js-suffix` is set to true (which is the default), then, in addition to minification, the action will change all **relative imports** (beginning with `./` or `../`) in the minified javascript files **to have the `.min` suffix.**
> This behaviour is not very smart - it just does a simple replace, without regard to what files are actually being minified.

### JavaScript Configuration

The config file passed to the `js-config` option should be a json file containing an UglifyJS config object. See the [UglifyJS repo][uglifyjs_conf] for details on what options are available and how to structure the config.

The default config if none is provided is:
```json
{
  "compress": false,
  "mangle": {
    "properties": {
      "regex": "/^#/" // mangles private class fields/methods
    }
  }
}
```
## Support

[![Issues][badge_issues]][link_issues]
[![Issues][badge_pulls]][link_pulls]

If you find any errors, or have a feature request, please [make an issue][link_create_issue] to let me know!

## License

This is open-sourced software licensed under the [MIT License][link_license].



[uglifyjs]:https://github.com/mishoo/UglifyJS
[uglifyjs_conf]:https://github.com/mishoo/UglifyJS#minify-options-structure

[link_build]:https://github.com/egad13/web-minify-action/actions
[link_license]:https://github.com/egad13/web-minify-action/blob/main/LICENSE
[link_issues]:https://github.com/egad13/web-minify-action/issues
[link_create_issue]:https://github.com/egad13/web-minify-action/issues/new
[link_pulls]:https://github.com/egad13/web-minify-action/pulls

[badge_build]:https://img.shields.io/github/actions/workflow/status/egad13/web-minify-action/build.yml?branch=main&maxAge=30
[badge_release_version]:https://img.shields.io/github/release/egad13/web-minify-action.svg?maxAge=30
[badge_license]:https://img.shields.io/github/license/egad13/web-minify-action.svg?longCache=true
[badge_release_date]:https://img.shields.io/github/release-date/egad13/web-minify-action.svg?maxAge=180
[badge_commits_since_release]:https://img.shields.io/github/commits-since/egad13/web-minify-action/latest.svg?maxAge=45
[badge_issues]:https://img.shields.io/github/issues/egad13/web-minify-action.svg?maxAge=45
[badge_pulls]:https://img.shields.io/github/issues-pr/egad13/web-minify-action.svg?maxAge=45
