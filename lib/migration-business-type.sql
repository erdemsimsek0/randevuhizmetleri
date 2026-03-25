-- Add business_type column to businesses table
alter table businesses add column if not exists business_type text not null default 'diger';
