#!/bin/bash

d=$(echo `git rev-parse --git-path hooks`)

echo "$d"

echo '
#!/bin/bash

if [ -z "$1" ]; then
	echo "Missing argument (commit message). Did you try to run this manually?"
	exit 1
fi

commitTitle="$(cat $1 | head -n1)"

if which node > /dev/null
then
    # installed dependencies
    package="@commitlint/cli"
    if [ `npm list -g | grep -c $package` -eq 0 ]; then
        npm install -g @commitlint/cli @commitlint/config-conventional
    fi

    echo $commitTitle | npx --no-install commitlint -x="@commitlint/config-conventional"
else
    # check semantic versioning scheme
    if ! echo "$commitTitle" | grep -qE "^(?:feat|fix|docs|style|refactor|perf|test|chore)\(?(?:\w+|\s|\-|_)?\)?:\s\w+"; then
        echo "✖ input: ${commitTitle}"

        echo "✖ type must be one of [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test]"

        echo "✖ help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint"
        exit 1
    fi
fi
' >> "$d/commit-msg"

chmod 500 "$d/commit-msg"
