import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import OrganizationVoterGuideCandidateList from '../../components/VoterGuide/OrganizationVoterGuideCandidateList';
import { capitalizeString } from '../../utils/textFormat';
import AnalyticsActions from '../../actions/AnalyticsActions';
import LoadingWheel from '../../components/LoadingWheel';
import { renderLog } from '../../utils/logging';
import OfficeActions from '../../actions/OfficeActions';
import OfficeStore from '../../stores/OfficeStore';
import VoterStore from '../../stores/VoterStore';

// This is based on routes/Ballot/Office
export default class OrganizationVoterGuideOffice extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      office: {},
      office_we_vote_id: '',
      organization_we_vote_id: '',
    };
  }

  componentDidMount () {
    this.officeStoreListener = OfficeStore.addListener(this.onOfficeStoreChange.bind(this));
    const office = OfficeStore.getOffice(this.props.params.office_we_vote_id);
    if (!office || !office.ballot_item_display_name) {
      OfficeActions.officeRetrieve(this.props.params.office_we_vote_id);
    } else {
      this.setState({ office });
    }
    this.setState({
      office_we_vote_id: this.props.params.office_we_vote_id,
      organization_we_vote_id: this.props.params.organization_we_vote_id,
    });

    AnalyticsActions.saveActionOffice(VoterStore.electionId(), this.props.params.office_we_vote_id);
    // console.log("OrganizationVoterGuideOffice, organization_we_vote_id: ", this.props.params.organization_we_vote_id);
  }

  // eslint-disable-next-line camelcase,react/sort-comp
  UNSAFE_componentWillReceiveProps (nextProps) {
    // When a new office is passed in, update this component to show the new data
    const office = OfficeStore.getOffice(nextProps.params.office_we_vote_id);
    if (!office || !office.ballot_item_display_name) {
      this.setState({ office_we_vote_id: nextProps.params.office_we_vote_id });
      OfficeActions.officeRetrieve(nextProps.params.office_we_vote_id);
    } else {
      this.setState({ office, office_we_vote_id: nextProps.params.office_we_vote_id });
    }
  }

  componentWillUnmount () {
    this.officeStoreListener.remove();
  }

  onOfficeStoreChange () {
    const { office_we_vote_id: officeWeVoteId } = this.state;
    const office = OfficeStore.getOffice(officeWeVoteId);
    this.setState({ office });
  }

  render () {
    renderLog('OrganizationVoterGuideOffice');  // Set LOG_RENDER_EVENTS to log all renders
    const { office } = this.state;

    if (!office || !office.ballot_item_display_name) {
      // TODO DALE If the office_we_vote_id is not valid, we need to update this with a notice
      return (
        <div className="container-fluid well u-stack--md u-inset--md">
          <div>{LoadingWheel}</div>
          <br />
        </div>
      );
    }
    const officeName = capitalizeString(office.ballot_item_display_name);
    const titleText = `${officeName} - We Vote`;
    const descriptionText = `Choose who you support for ${officeName}in the November Election`;

    return (
      <div>
        <Helmet
          title={titleText}
          meta={[{ name: 'description', content: descriptionText }]}
        />
        { office.candidate_list ? (
          <div>
            <OrganizationVoterGuideCandidateList
              contest_office_name={office.ballot_item_display_name}
              organization_we_vote_id={this.state.organization_we_vote_id}
            >
              {office.candidate_list}
            </OrganizationVoterGuideCandidateList>
          </div>
        ) :
          <span>Loading candidates...</span>
        }
      </div>
    );
  }
}
