#!/usr/bin/env bash
set -eu

# Run unit and e2e tests for all contracts
cargo test --features e2e-tests