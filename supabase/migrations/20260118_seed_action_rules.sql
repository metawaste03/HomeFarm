-- Seed Migration: Initial Action Rules for Today's Actions
-- 10 rules covering Layer, Broiler, Fish sectors and general farm management
-- Rule 1: No logs in 2+ days (General - applies to all farms)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'no_recent_logs',
        'Missing Daily Logs',
        'You haven''t logged any farm activities in the past 2 days. Regular logging helps track trends and catch issues early.',
        'Go to the Logs tab and record today''s activities for your batches.',
        NULL,
        'warning',
        'days_since_last_log',
        '{"days": 2}'
    );
-- Rule 2: High mortality rate (General - all poultry)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'high_mortality_rate',
        'High Mortality Alert',
        'Mortality rate has exceeded 2% in the last 24 hours. This could indicate disease outbreak, environmental stress, or feed issues.',
        'Inspect the affected batch immediately. Check for signs of illness, review environmental conditions, and consider consulting a veterinarian.',
        NULL,
        'critical',
        'mortality_rate',
        '{"threshold_percent": 2, "hours": 24}'
    );
-- Rule 3: Vaccination/Health schedule due (General - all poultry)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'health_schedule_due',
        'Vaccination Due Soon',
        'A scheduled vaccination or health treatment is coming up within the next 3 days.',
        'Prepare the required vaccines/medications and schedule time for administration. Ensure you have adequate supplies.',
        NULL,
        'warning',
        'health_schedule_due',
        '{"days_ahead": 3}'
    );
-- Rule 4: Low feed inventory (General)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'low_feed_inventory',
        'Feed Stock Running Low',
        'Your feed inventory has dropped below the minimum threshold. Running out of feed can severely impact production and animal health.',
        'Contact your supplier and place a feed order immediately. Consider keeping a buffer stock to prevent future shortages.',
        NULL,
        'critical',
        'inventory_below_threshold',
        '{"category": "Feed"}'
    );
-- Rule 5: Egg production drop (Layer sector)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'egg_production_drop',
        'Egg Production Declining',
        'Egg production has dropped by more than 10% over the past 3 days. This could indicate stress, disease, nutrition issues, or lighting problems.',
        'Review recent changes in feed, lighting schedule, or environment. Check for signs of illness and ensure layers are getting 16 hours of light daily.',
        'Layer',
        'warning',
        'egg_production_drop',
        '{"drop_percent": 10, "days": 3}'
    );
-- Rule 6: Layer approaching peak production age (Layer sector)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'layer_peak_production',
        'Layers Approaching Peak Production',
        'Your layer batch is between 20-30 weeks old - the peak production period. This is when optimal nutrition and care are most critical.',
        'Ensure layers are receiving quality layer feed with adequate calcium (3.5-4%). Monitor egg quality and production rates closely.',
        'Layer',
        'info',
        'age_in_weeks',
        '{"min_weeks": 20, "max_weeks": 30, "message": "Peak production period - maximize nutrition"}'
    );
-- Rule 7: Broiler weight below expected (Broiler sector)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'broiler_underweight',
        'Broilers Underweight',
        'Broiler weight is more than 15% below the expected weight for their age. This affects profitability and may indicate feeding or health issues.',
        'Review feed quality and consumption rates. Check for disease, overcrowding, or environmental stressors. Consider feed additives if appropriate.',
        'Broiler',
        'warning',
        'weight_below_expected',
        '{"weights_by_week": {"1": 180, "2": 450, "3": 850, "4": 1400, "5": 1950, "6": 2500, "7": 3000, "8": 3400}, "tolerance_percent": 15}'
    );
-- Rule 8: Broiler approaching market age (Broiler sector)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'broiler_market_age',
        'Broilers Ready for Market',
        'Your broiler batch is between 6-8 weeks old and approaching market weight. Time to prepare for sale or processing.',
        'Contact buyers or processors to schedule pickup. Begin feed withdrawal 8-12 hours before processing. Prepare transport crates.',
        'Broiler',
        'info',
        'age_in_weeks',
        '{"min_weeks": 6, "max_weeks": 8, "message": "Market weight reached"}'
    );
-- Rule 9: Task overdue (General)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'task_overdue',
        'Overdue Tasks',
        'You have tasks past their due date. Keeping on top of tasks helps maintain farm efficiency and animal welfare.',
        'Review your task list and complete or reschedule overdue items. Consider delegating if workload is too high.',
        NULL,
        'info',
        'task_overdue',
        '{}'
    );
-- Rule 10: Batch missing start date (General - data quality)
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params
    )
VALUES (
        'batch_missing_start_date',
        'Batch Age Unknown',
        'One or more active batches don''t have a start date set. This prevents accurate age calculations for health schedules and production tracking.',
        'Edit the batch details and add the correct start date when the batch was introduced to your farm.',
        NULL,
        'info',
        'batch_missing_start_date',
        '{}'
    );