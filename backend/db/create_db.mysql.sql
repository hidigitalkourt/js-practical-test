DROP DATABASE IF EXISTS bugs;

CREATE DATABASE bugs DEFAULT CHARACTER SET 'utf8';
USE bugs;

CREATE TABLE bugs(
    bug_id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    assignee VARCHAR(255) DEFAULT NULL,
    status VARCHAR(255) DEFAULT NULL,
    INDEX(assignee),
    INDEX(status)
) ENGINE = 'InnoDb' DEFAULT CHARACTER SET = 'utf8';

INSERT INTO `bugs` VALUES
    (1,'Not enough blue','Must increase blue in color scheme because I like blue','David','closed'),
    (2,'Too much grey','Must decrease grey in color scheme because it does not look good in the dark.','Jim','open'),
    (3,'Brighter orange','Make the shade of orange slightly brighter.',NULL,'open');
