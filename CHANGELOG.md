# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.2.0] - 2025-11-17

### Added
- Dynamic character counter that displays remaining characters as user types commit message
- Character limit enforcement preventing input beyond 72 characters in re-prompt flow
- Ability to keep original long commit message by pressing Enter when prompted

### Changed
- Enhanced commit message length validation flow with improved user experience
- Warning for long commit messages now offers option to enter new message or keep original
- Commit message prompts now show real-time character count feedback

### Fixed
- Improved handling of commit messages exceeding 72 character limit
