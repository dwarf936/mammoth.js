# Changelog

## [1.4.19] - 2025-05-24

### Added
- Added `getUserStyle(styleName)` method to get user-defined styles by name
- The method accepts a style name as parameter and returns an object with style properties

### Fixed
- Fixed type mismatch in Document object's styles property
- Fixed test case failures related to styles object comparison
- Fixed defaultStyles creation with insufficient parameters

### Technical Changes
- Modified Styles constructor to expose internal style collections as public properties
- Updated readStylesFromZipFile to use Styles.EMPTY as default value
- Ensured all tests pass
