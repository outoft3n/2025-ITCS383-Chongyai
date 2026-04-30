import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConferenceRoom } from '@/components/conference/ConferenceRoom';
import api from '@/lib/api';
import type { ApiResponse, Conference } from '@/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  default: { get: jest.fn(), post: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

const mockConference: Conference = {
  id: 'conf1',
  roomCode: 'ROOM-123',
  title: 'Interview Session',
  status: 'ACTIVE',
  startedAt: '2024-01-01T10:00:00Z',
  endedAt: null,
  createdAt: '2024-01-01T09:00:00Z',
  participants: [
    {
      id: 'p1',
      conferenceId: 'conf1',
      userId: 'u1',
      joinedAt: '2024-01-01T10:00:00Z',
      leftAt: null,
    },
  ],
};

const conferenceResponse: ApiResponse<Conference> = {
  success: true,
  data: mockConference,
};

describe('ConferenceRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.post = jest.fn().mockResolvedValue({});
  });

  it('shows loading state while fetching', () => {
    mockedApi.get = jest.fn().mockReturnValue(new Promise(() => {}));
    render(<ConferenceRoom roomCode="ROOM-123" />);
    expect(screen.getByText('Joining room...')).toBeInTheDocument();
  });

  it('renders room header after successful fetch', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    render(<ConferenceRoom roomCode="ROOM-123" />);

    await waitFor(() =>
      expect(screen.queryByText('Joining room...')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Interview Session')).toBeInTheDocument();
    expect(screen.getByText(/ROOM-123/)).toBeInTheDocument();
  });

  it('shows participant count', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    render(<ConferenceRoom roomCode="ROOM-123" />);

    await waitFor(() =>
      expect(screen.queryByText('Joining room...')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('1 participant(s)')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Room not found'));
    render(<ConferenceRoom roomCode="ROOM-BAD" />);

    await waitFor(() =>
      expect(screen.getByText('Failed to join room')).toBeInTheDocument(),
    );
    expect(screen.getByText('Room not found')).toBeInTheDocument();
  });

  it('calls POST join on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    render(<ConferenceRoom roomCode="ROOM-123" />);

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith('/conference/rooms/ROOM-123/join'),
    );
  });

  it('toggles mute on button click', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    render(<ConferenceRoom roomCode="ROOM-123" />);
    await waitFor(() =>
      expect(screen.queryByText('Joining room...')).not.toBeInTheDocument(),
    );

    expect(screen.getByTitle('Mute')).toBeInTheDocument();
    await userEvent.click(screen.getByTitle('Mute'));
    expect(screen.getByTitle('Unmute')).toBeInTheDocument();
  });

  it('toggles camera on button click', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    render(<ConferenceRoom roomCode="ROOM-123" />);
    await waitFor(() =>
      expect(screen.queryByText('Joining room...')).not.toBeInTheDocument(),
    );

    expect(screen.getByTitle('Turn off camera')).toBeInTheDocument();
    await userEvent.click(screen.getByTitle('Turn off camera'));
    expect(screen.getByTitle('Turn on camera')).toBeInTheDocument();
  });

  it('calls onLeave callback when leave button is clicked', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    const onLeave = jest.fn();
    render(<ConferenceRoom roomCode="ROOM-123" onLeave={onLeave} />);
    await waitFor(() =>
      expect(screen.queryByText('Joining room...')).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByTitle('Leave call'));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('calls POST leave when leave button is clicked', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: conferenceResponse });
    render(<ConferenceRoom roomCode="ROOM-123" />);
    await waitFor(() =>
      expect(screen.queryByText('Joining room...')).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByTitle('Leave call'));
    expect(mockedApi.post).toHaveBeenCalledWith('/conference/rooms/ROOM-123/leave');
  });
});
