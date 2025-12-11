import argon2 from "argon2";
import { prisma } from "@/lib/prisma";

export const mockUsers = {
  bobby: {
    email: "bobby@example.com",
    password: "SecurePass123!",
    hashedPassword: "", // Will be filled in runtime
  },
  scarlet: {
    email: "scarlet@example.com",
    password: "AnotherPass456!",
    hashedPassword: "",
  },
};

export async function hashMockPasswords() {
  mockUsers.bobby.hashedPassword = await argon2.hash(mockUsers.bobby.password);
  mockUsers.scarlet.hashedPassword = await argon2.hash(
    mockUsers.scarlet.password
  );
}

export const mockStravaTokenResponse = {
  token_type: "Bearer",
  expires_at: Math.floor(Date.now() / 1000) + 3600 * 6, // 6 hours from now
  expires_in: 3600 * 6,
  refresh_token: "mock_refresh_token_12345",
  access_token: "mock_access_token_67890",
  athlete: {
    id: 123456789,
    username: "bobby_runner",
    ressource_state: 2,
    firstname: "Bobby",
    lastname: "Doe",
    bio: "Trail runner",
    city: "Boulder",
    state: "Colorado",
    country: "United States",
    sex: "M",
    premium: true,
    summit: false,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
    badge_type_id: 1,
    weight: 70.5,
    profile_medium: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
    profile: "https://i.pravatar.cc/300?u=a042581f4e29026704e",
    friend: null,
    follower: null,
  },
};

export const mockStravaActivities = [
  {
    id: 11111111111,
    external_id: "external_111111.gpx",
    upload_id: 22222222222,
    athlete: {
      id: 123456789,
      resource_state: 1,
    },
    name: "Morning Trail Run",
    distance: 10500.5,
    moving_time: 3600,
    elapsed_time: 3700,
    total_elevation_gain: 250.0,
    elev_high: 2100.5,
    elev_low: 1850.0,
    sport_type: "TrailRun",
    start_date: "2024-11-01T08:00:00Z",
    start_date_local: "2024-11-01T02:00:00Z",
    timezone: "(GMT-07:00) America/Denver",
    start_latlng: [40.0150, -105.2705],
    end_latlng: [40.0180, -105.2680],
    achievement_count: 5,
    kudos_count: 20,
    comment_count: 3,
    athlete_count: 1,
    photo_count: 3,
    total_photo_count: 5,
    map: {
      id: "a11111111111",
      summary_polyline: "mock_polyline_data",
      resource_state: 2,
    },
    device_name: "Garmin Forerunner 945",
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    visibility: "everyone",
    flagged: false,
    workout_type: null,
    upload_id_str: "22222222222",
    average_speed: 2.9,
    max_speed: 4.5,
    has_kudoed: false,
    hide_from_home: false,
    gear_id: "g123456",
    kilojoules: 450.5,
    average_watts: 180,
    device_watts: true,
    max_watts: 350,
    weighted_average_watts: 195,
    has_heartrate: true,
    average_heartrate: 152.3,
    max_heartrate: 178,
    heartrate_opt_out: false,
    display_hide_heartrate_option: true,
  },
];

export async function seedTestUsers() {
  if (!mockUsers.bobby.hashedPassword || !mockUsers.scarlet.hashedPassword) {
    await hashMockPasswords();
  }

  const bobby = await prisma.user.create({
    data: {
      email: mockUsers.bobby.email,
      password: mockUsers.bobby.hashedPassword,
    },
  });

  const scarlet = await prisma.user.create({
    data: {
      email: mockUsers.scarlet.email,
      password: mockUsers.scarlet.hashedPassword,
    },
  });

  return { bobby, scarlet };
}

export async function seedSingleTestUser(userKey: keyof typeof mockUsers) {
  const userData = mockUsers[userKey];

  if (!userData.hashedPassword) {
    userData.hashedPassword = await argon2.hash(userData.password);
  }

  const createdUser = await prisma.user.create({
    data: {
      email: userData.email,
      password: userData.hashedPassword,
    },
  });

  return {
    id: createdUser.id,
    email: createdUser.email,
  };
}
