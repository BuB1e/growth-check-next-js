export interface LocationResponse {
    id: number;
    name: string;
    map: string;
    province: string;
    district: string;
    sub_district: string;
    zip_code: string;
    team_id: number;
    location_create_request: number | null; // NULL = admin/manual
    created_by_user: string; //admin/user
    created_at: Date;
    updated_at: Date;
    delete_status: boolean;
}