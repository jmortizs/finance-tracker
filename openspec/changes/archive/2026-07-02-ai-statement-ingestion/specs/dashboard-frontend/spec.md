## ADDED Requirements

### Requirement: Sidebar statement upload widget
The dashboard sidebar SHALL display a single-file PDF statement upload widget above the existing Refresh and Reset action buttons.

#### Scenario: Upload widget renders above dashboard actions
- **WHEN** the user opens the dashboard application
- **THEN** the sidebar displays a statement PDF upload container before the Refresh and Reset buttons
- **AND** the upload control accepts one PDF file at a time

#### Scenario: Uploaded statement refreshes dashboard data
- **WHEN** the user uploads a valid bank statement PDF from the sidebar widget
- **THEN** the frontend sends the file to `/api/v1/statements/upload`
- **AND** successful ingestion triggers a dashboard refresh
- **AND** the user sees an ingestion status message

#### Scenario: Upload failure is visible
- **WHEN** statement upload fails because of duplicate content, validation failure, configuration error, or API failure
- **THEN** the sidebar displays an error message without clearing the dashboard frame
