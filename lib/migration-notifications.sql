-- Add notification preference columns to businesses
alter table businesses add column if not exists notify_new_appointment boolean default true;
alter table businesses add column if not exists notify_confirm_customer boolean default true;
alter table businesses add column if not exists notify_cancel_customer boolean default true;
