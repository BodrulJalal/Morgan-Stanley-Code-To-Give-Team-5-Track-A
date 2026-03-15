"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { mockContacts } from "@/components/data/adminMockData";

export default function AdminContactsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(null);
  const [minEventsFilter, setMinEventsFilter] = useState<number | "">("");

  const neighborhoodOptions = useMemo(
    () => [...new Set(mockContacts.map((contact) => contact.neighborhood))].sort(),
    []
  );

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockContacts.filter((contact) => {
      const matchesQuery =
        !q ||
        [contact.name, contact.email, contact.phone, contact.neighborhood].some((field) =>
          field.toLowerCase().includes(q)
        );
      const matchesStatus = !statusFilter || contact.status === statusFilter;
      const matchesNeighborhood =
        !neighborhoodFilter || contact.neighborhood === neighborhoodFilter;
      const matchesMinEvents =
        minEventsFilter === "" || contact.totalEventsAttended >= minEventsFilter;

      return matchesQuery && matchesStatus && matchesNeighborhood && matchesMinEvents;
    });
  }, [query, statusFilter, neighborhoodFilter, minEventsFilter]);

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Contacts</Title>
          <Text c="dimmed" fz="sm">
            Directory of all volunteers who have attended at least one event.
          </Text>
        </div>

        <Card withBorder radius="xl" p="lg">
          <Group justify="space-between" mb="md">
            <Text fw={600}>Volunteer Contacts</Text>
            <Text c="dimmed" fz="sm">
              {filteredContacts.length} contacts
            </Text>
          </Group>
          <Stack gap="sm" mb="md">
            <TextInput
              placeholder="Search by name, email, phone, neighborhood"
              leftSection={<IconSearch size={16} />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <Group grow align="end">
              <Select
                label="Status"
                placeholder="All statuses"
                clearable
                data={[
                  { value: "active", label: "Active" },
                  { value: "warm", label: "Warm" },
                  { value: "inactive", label: "Inactive" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              <Select
                label="Neighborhood"
                placeholder="All neighborhoods"
                clearable
                data={neighborhoodOptions.map((value) => ({ value, label: value }))}
                value={neighborhoodFilter}
                onChange={setNeighborhoodFilter}
              />
              <NumberInput
                label="Min events attended"
                placeholder="Any"
                min={0}
                value={minEventsFilter}
                onChange={(value) => setMinEventsFilter(typeof value === "number" ? value : "")}
              />
              <Button
                variant="light"
                onClick={() => {
                  setQuery("");
                  setStatusFilter(null);
                  setNeighborhoodFilter(null);
                  setMinEventsFilter("");
                }}
              >
                Clear filters
              </Button>
            </Group>
          </Stack>
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Neighborhood</Table.Th>
                  <Table.Th>Events Attended</Table.Th>
                  <Table.Th>Last Attended</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredContacts.map((contact) => (
                  <Table.Tr key={contact.id}>
                    <Table.Td>{contact.name}</Table.Td>
                    <Table.Td>{contact.email}</Table.Td>
                    <Table.Td>{contact.phone}</Table.Td>
                    <Table.Td>{contact.neighborhood}</Table.Td>
                    <Table.Td>{contact.totalEventsAttended}</Table.Td>
                    <Table.Td>
                      {new Date(contact.lastAttendedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          contact.status === "active"
                            ? "green"
                            : contact.status === "warm"
                              ? "yellow"
                              : "gray"
                        }
                        variant="light"
                      >
                        {contact.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </Stack>
    </Container>
  );
}
