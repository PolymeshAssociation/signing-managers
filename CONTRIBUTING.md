# Contributing

_DISCLAIMER: These guidelines (as well as all documentation) are in constant development. Any feedback is greatly appreciated. Just open a github issue and we will do our best to incorporate your suggestions within reason._

Thanks for your efforts in helping the Polymesh ecosystem grow!

We accept PRs with all kinds of contributions, including the creation of custom signing managers to support currently unsupported use cases.

## Custom Signing Managers

To create a new signing manager, run `yarn generate:signing-manager <name>`. This will create a `packages/<name>` directory with all the necessary configuration to build/test/release an npm package called `@polymeshassociation/<name>`. Unit tests must be written using the [jest](https://jestjs.io/) testing framework.

### Naming

The package should be called `<something>-signing-manager` (i.e. `hashicorp-vault-signing-manager`). Use existing packages as an example.

## Commits

This repo uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

In order to ensure commits are properly formatted, we use husky to hijack the `git commit` command, so that it launches the commitizen CLI. Additionally, commit messages are validated with commitlint.

For automated release versions to work properly, commits must have the affected package name as a scope. For example, if adding a new feature to the `local-signing-manager` package, the commit message should be `feat(local-signing-manager): sign raw messages`. Multiple comma-separated scopes are supported if a commit affects more than one package. Since the commitizen CLI does not support multiple scopes, they would have to be added in the editor when confirming the message. Commits that affect all packages can use `*` as a scope.

## PR Requirements

In order for a PR to be merged, it must:

- Produce no linting errors
- Have the proper type, scope and description in all commits
- Be reasonably type safe (avoid type assertions, non-null assertions and use of `any` and `unknown` within reason)
- Pass all unit tests
- Pass the sonarcloud quality gate (no code smells and 100% unit test coverage)
- Be properly documented with JSDoc comments
- Be added to the table in the project README
- Have an installation and usage example in its own README

On top of that, all PRs will be subject to review by the Polymesh association. The association reserves the right to reject submissions on any basis. That said, we certainly welcome and encourage external contributions.

As soon as your PR is merged, our CI pipeline will handle releasing new versions of all affected packages to npm.
