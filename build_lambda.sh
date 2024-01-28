#!/bin/bash

[ "$DEBUG" == 'true' ] && set -x
set -e

lambda_function_name="$1"

echo "------------------------------------------------------------------------------"
echo "Bulding lambda function $lambda_function_name"
echo "------------------------------------------------------------------------------"

# Get reference for all important folders
root_path="$PWD"
build_dist_dir="$root_path/lambda_zip"

echo "------------------------------------------------------------------------------"
echo "[Init] Remove any old dist files from previous runs"
echo "------------------------------------------------------------------------------"
rm -rf $build_dist_dir
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Init] Install dependencies for Lambda function"
echo "------------------------------------------------------------------------------"
echo "Installing dependencies for $lambda_function_name"

for temp_folder in "coverage" "v-env" "__pycache__"; do
    if [ -d "$temp_folder" ]; then
        echo "$temp_folder exists, removing it"
        rm -rf $temp_folder
    fi
done

if [ -e "package.json" ]; then
    npm ci --only=prod
fi

cd ..

echo "------------------------------------------------------------------------------"
echo "[Packing] Source code artifacts"
echo "------------------------------------------------------------------------------"

# Zip artifacts from asset folder
zip -qr ../$lambda_function_name.zip Vote_App_Server/**/* -x "test/*" "mock/*" "package-lock.json" ".github/*" "build_lambda.sh" "README.md"
cd ..

# Copy the zipped artifact from /staging to /regional-s3-assets
cp $lambda_function_name.zip $build_dist_dir

# Remove the old artifacts from /staging
rm $lambda_function_name.zip
