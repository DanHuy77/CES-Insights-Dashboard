## Deployment

See three different stages below:

#### Development

PR was merged to `main` will be deployed automatically.

#### Staging

Tag the hash where you want to deploy to staging following this format 'staging.[0-9]'

```sh
tag="staging.`date "+%Y%m%d%H%m"`"

git tag -a $tag -m "Your message here"

git push origin $tag
```

#### Production

Pick a release in the release page then hit the `Publish Release`.
New release tag will be shown then the CI will deploy to production automatically.

You can also use the same way with staging deployment with `production` prefix.

```sh
tag="production.`date "+%Y%m%d%H%m"`"

git tag -a $tag -m "Your message here"

git push origin $tag
```

