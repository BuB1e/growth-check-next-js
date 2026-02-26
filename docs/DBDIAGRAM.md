// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table user {
  id                 uuid      [pk]
  email              varchar  [unique]
  emailVerified      boolean
  team_id            int      [ref: > team.id]
  first_name         varchar
  last_name          varchar
  identification_id  varchar  [unique, not null]
  role               user_role
  created_at         datetime
  updated_at         datetime
  delete_status      boolean [default: false, not null]
}

Table user_create_status {
  id                      uuid              [pk]
  user_id                 uuid              [unique, ref: > user.id]
  request_status          request_status    [default: request_status.waiting]
  reject_reason           varchar
  updated_by              uuid              [ref: > user.id]
  updated_at              datetime
  created_at              datetime
}

Enum user_role {
  admin
  user
  head
}

Table team {
  id         int      [pk, increment]
  name       varchar
  created_at datetime
  updated_at datetime
  delete_status      boolean [default: false, not null]
}

Table location {
  id              int      [pk, increment]
  name            varchar
  map             varchar
  province        varchar
  district        varchar
  sub_district    varchar
  zip_code        varchar
  team_id         int      [ref: - team.id, not null]
  location_create_request      int      [ref: > location_create_request.id, null] // NULL = admin/manual
  created_by_user varchar  [not null] //admin/user
  created_at      datetime
  updated_at      datetime
  delete_status      bit [default: 0, not null]
}

Table location_create_request {
  id              int      [pk, increment]
  user_id         uuid      [ref: > user.id, not null]
  location_name   varchar
  location_map    varchar //maps
  province        varchar
  district        varchar
  sub_district    varchar
  zip_code        varchar
  status          request_status
  handled_by      uuid
  created_at      datetime
  updated_at      datetime
  delete_status      boolean [default: false, not null]
}

Table child_transfer_request {
  id              int      [pk, increment]
  user_id         uuid      [ref: > user.id, not null]
  child_id        id
  from_location   id
  to_location     id
  status          request_status
  handled_by      uuid
  created_at      datetime
  updated_at      datetime
  delete_status      boolean [default: false, not null]
}

Enum request_status {
  approve
  reject
  waiting
}

Table parent {
  id               int      [pk, increment]
  identification_id varchar  [unique, not null]
  first_name       varchar
  last_name        varchar
  phone_no         varchar
  gender           gender
  detail           varchar    [null]
  created_at       datetime
  updated_at       datetime
  delete_status      boolean [default: false, not null]
}

Enum gender {
  male
  female
}

Table child_parent {
  id                 int      [pk, increment]
  child_id           int      [ref: > child.id]
  parent_id          int      [ref: > parent.id]
  relationship_type  relationship_type
  created_at         datetime
  updated_at         datetime
  delete_status      boolean [default: false, not null]

  // ใส่ unique แบบ inline ที่ field ไหนก็ได้ เช่นที่ parent_id
  indexes {
    (child_id, parent_id) [unique]
  }
}

Enum relationship_type {
  father
  mother
  guardian
}

Table child {
  id               int      [pk, increment]
  first_name       varchar
  last_name        varchar
  location_id      int      [ref: > location.id]
  birth_date       date
  gender           gender
  created_by_user  uuid      [ref: > user.id]
  created_at       datetime
  updated_at       datetime
  status           child_status
  delete_status      boolean [default: false, not null]
}

Enum child_status {
  In_Area
  Out_Area
  Unknown
  die
}

Table child_data {
  id                   int      [pk, increment]
  child_id             int      [ref: > child.id]
  location_id          int      [ref: > location.id]
  height               float
  weight               float
  height_development_status_id       int       [ref: - development.id]
  weight_development_status_id       int       [ref: - development.id]
  weight_date          datetime
  height_date          datetime
  "index"              int
  user_created         uuid
  user_updated         uuid
  created_at           datetime
  updated_at           datetime
  delete_status      boolean [default: false, not null]
}

Table development{
  id                   int [pk, increment]
  metric               metric_type
  status               varchar
  detail               varchar
  min_age              int
  max_age              int
  suggestion           varchar
  created_at           datetime
  updated_at           datetime
  delete_status      boolean [default: false, not null]
}

Enum metric_type {
  WA   // Weight-for-age
  HA   // Height-for-age
  BMI  // BMI-for-age
  WH   // Weight-for-height (ถ้าใช้ในอนาคต)
  WL   // Weight-for-length
}

Table ai_prediction {
  id                            int      [pk, increment]
  child_id                      int      [ref: > child.id]
  height_development_status_id  int      [ref: - development.id]
  weight_development_status_id  int      [ref: - development.id]
  data_months_used              int
  model_used                    varchar
  model_version                 varchar
  date_time                     datetime
  month                         int
  height                        float
  weight                        float
  created_at                    datetime
}

Table session {
  id             int      [pk, increment]
  user_id        uuid      [ref: > user.id]
  token          varchar  [unique]
  expires_at     datetime
  user_agent     varchar
  ip_address      varchar
  status_session varchar
  created_at     datetime
  updated_at     datetime
}

Table account {
  id                     int      [pk, increment]
  user_id                uuid      [ref: > user.id]
  account_id              varchar
  provider_id             varchar
  password               varchar
  id_token                varchar
  scope                  varchar
  refresh_token           varchar
  refresh_token_expires_at  datetime
  access_token            varchar
  access_token_expires_at   datetime
  created_at             datetime
  updated_at             datetime
}

Table verification {
  id         int      [pk, increment]
  identifier varchar
  value      varchar
  expires_at datetime
  created_at datetime
  updated_at datetime
}
