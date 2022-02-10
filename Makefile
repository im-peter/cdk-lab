AWS_PROFILE=personal-account

@PHONY: synthesize list deploy diff destroy bootstrap

synthesize:
	npx cdk synthesize --profile=personal-account

list:
	npx cdk list -v --profile=personal-account

build:
	npm run build

deploy: build
	npx cdk deploy --profile=personal-account --outputs-file ./cdk-outputs.json

diff:
	npx cdk diff --profile=personal-account

destroy:
	npx cdk destroy --profile=personal-account

bootstrap:
	npx cdk bootstrap --profile=personal-account