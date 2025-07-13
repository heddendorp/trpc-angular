yarn install
yarn changeset version
yarn build
git add .
git commit -m "chore: prerelease"
yarn changeset publish
git push --follow-tags
