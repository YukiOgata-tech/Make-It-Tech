#!/usr/bin/env bash
#
# Vercel の Ignored Build Step 用。vercel.json の ignoreCommand から呼ばれる。
#
#   exit 1 = ビルドする
#   exit 0 = ビルドをスキップする
#
# ドキュメントだけを変更したときに本番ビルドが走らないようにするのが目的。
#
# 基準点には VERCEL_GIT_PREVIOUS_SHA（最後に「成功した」デプロイのコミット）を使う。
# HEAD^ と比べないのは、コード変更とドキュメント変更を続けて push したときに
# 最新コミットしか見ずコード変更を取りこぼすため。スキップやビルド失敗では
# この値は更新されないので、次回は同じ基準点から差分を見ることになる。

set -u

# ビルドに影響しないパス。ここに載っているものだけが変わったならスキップする。
# 迷ったら追加しない（ビルドが走るだけで実害はないが、逆は本番が古いままになる）。
IGNORED_PATHS=(
  ':(exclude)docs/'
  ':(exclude).claude/'
  ':(exclude)README.md'
  ':(exclude)CLAUDE.md'
  ':(exclude)AGENTS.md'
  ':(exclude)GEMINI.md'
  ':(exclude).gitignore'
)

# 基準点が分からないときは必ずビルドする。
# 判断に迷ったらビルドする側に倒す（デプロイ漏れの方が事故として重い）。
if [ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" ]; then
  echo "build: 前回デプロイのSHAが取得できないため実行します"
  exit 1
fi

if ! git cat-file -e "${VERCEL_GIT_PREVIOUS_SHA}^{commit}" 2>/dev/null; then
  echo "build: 前回デプロイのSHA (${VERCEL_GIT_PREVIOUS_SHA}) がこのクローンに存在しないため実行します"
  exit 1
fi

if git diff --quiet "${VERCEL_GIT_PREVIOUS_SHA}" HEAD -- . "${IGNORED_PATHS[@]}"; then
  echo "skip: ドキュメント等の変更のみのためビルドをスキップします"
  git diff --name-only "${VERCEL_GIT_PREVIOUS_SHA}" HEAD | sed 's/^/  /'
  exit 0
fi

echo "build: ビルド対象のファイルが変更されています"
git diff --name-only "${VERCEL_GIT_PREVIOUS_SHA}" HEAD -- . "${IGNORED_PATHS[@]}" | sed 's/^/  /'
exit 1
