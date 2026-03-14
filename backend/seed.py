import os
import argparse
import random
from datetime import datetime, timedelta, timezone
from faker import Faker
from supabase import create_client, Client
from dotenv import load_dotenv

fake = Faker()
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") 

if not (SUPABASE_URL or SUPABASE_SERVICE_KEY):
	raise RuntimeError ("Missing Supbase URL or Service Key in .env file")

supabase: Client = create_client (SUPABASE_URL, SUPABASE_SERVICE_KEY)

def seed_users (count: int) -> list[str]:
	print(f"Creating {count} fake (realistic) users")

	user_ids = []

	for _ in range (count): 
		email = fake.unique.email()
		result = supbase.auth.admin.create_user (
			{
				"email": email, 
				"password": "morganstanleyhackathon", 
				"email_confirm": True,
				"user_metadata" : {
					"display_name": fake.name(),
				}, 
			} 
		) 

		uid = result.user.id
		user_ids.append(uid)

		supabase.table("profiles").update (
			{ 
				"display_name": fake.name(),	
				"bio": fake.sentence(nb_words=15),
			} 
		).eq("id", uid).execute()

		print (f" User -> [{email}, {uid}]")
		return user_ids


def seed_events (user_ids: list[str], count: int) -> list[str]:
	pass

def seed_attendees (user_ids: list[str], event_ids: list[str]) -> None: 
	pass

def main ():
	parser = argparse.ArgumentParser(description="Seed the Lemontree DB")
	parser.add_argument("--users", type=int, default=5, help="Number of fake users to create")
	parser.add_argument("--events", type=int, default=12, help="Number of fake events to create")
	args = parser.parse_args()

	print("Seeding database...")
	user_ids = seed_users(args.users)
	event_ids = seed_events(user_ids, args.events)
	seed_attendees(user_ids, event_ids)
	print("Hopefully it worked ...")


if __name__ == "__main__":
	main()
