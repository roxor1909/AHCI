import sqlite3
import random

from datetime import datetime
from datetime import timedelta

def get_connection():
    connection = sqlite3.connect('mirror.db')
    return connection

def create_schema_if_not_exists(db_connection):
    c = db_connection.cursor()

    query1 = """CREATE TABLE IF NOT EXISTS tb_data (
        entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        duration INTEGER NOT NULL
    );"""

    query2 = """CREATE TABLE IF NOT EXISTS tb_achievements (
        entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        achievement_name TEXT NOT NULL
    );"""

    c.execute(query1)
    c.execute(query2)

    db_connection.commit()
    c.close()

def get_tb_data_for_user(db_connection, user_name):
    c = db_connection.cursor()

    query1 = "SELECT timestamp, duration FROM tb_data WHERE user_name=?;"

    c.execute(query1, (user_name, ))
    res = c.fetchall()
    c.close()
    return res

def get_achievements_for_user(db_connection, user_name):
    c = db_connection.cursor()

    query1 = "SELECT achievement_name, timestamp FROM tb_achievements WHERE user_name=?;"

    c.execute(query1, (user_name, ))
    res = c.fetchall()
    c.close()
    return res

def insert_tb_data_for_user(db_connection, user_name, timestamp, duration):
    c = db_connection.cursor()

    query1 = "INSERT INTO tb_data VALUES(?, ?, ?, ?)"

    c.execute(query1, (None, user_name, timestamp, duration))

    db_connection.commit()
    c.close()

def insert_achievement_for_user(db_connection, user_name, timestamp, achievement_name):
    c = db_connection.cursor()

    query1 = "INSERT INTO tb_achievements VALUES(?, ?, ?, ?)"

    c.execute(query1, (None, user_name, timestamp, achievement_name))

    db_connection.commit()
    c.close()

def create_dummy_data():
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    normal_toothbrush = 3*60
    conn = get_connection()
    persona = ['kylo', 'leia', 'luke', 'rey']
    for person in persona:
        yesterday_brush = normal_toothbrush + (random.randint(0,30) - 15)
        todays_brush = normal_toothbrush + (random.randint(0,30) - 15)
        insert_tb_data_for_user(conn, person, yesterday, yesterday_brush)
        insert_tb_data_for_user(conn, person, now, todays_brush)
