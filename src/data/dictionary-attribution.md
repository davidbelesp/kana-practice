# Dictionary data

The Vocabulary Hub combines the existing curated learner vocabulary with the generated static index at `src/data/dictionary.generated.ts`.

Run `pnpm dictionary:build` to refresh the generated index. The script downloads the common-only English JMdict-Simplified release, normalizes Japanese terms, readings, glosses, parts of speech, and priority metadata into the app schema, and commits the result as static TypeScript data. Runtime search never calls a dictionary API.

Attribution and license:

- Source: [jmdict-simplified](https://github.com/scriptin/jmdict-simplified), which distributes derived JMdict JSON files.
- Original dictionary: JMdict by the Electronic Dictionary Research and Development Group (EDRDG), used under the [EDRDG license](http://www.edrdg.org/edrdg/licence.html).
- Derived JMdict data must retain the original JMdict/EDRDG license and attribution when redistributed.
